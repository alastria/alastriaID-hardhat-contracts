// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../openzeppelin/Initializable.sol";

contract AlastriaPresentationRegistry is Initializable {

    /* Major updates in V2.1, in order to enhance privacy and allow for a smooth transition to V2.1 and future V2.2.

    - addSubjectPresentation marked as To Be Deprecated for new version 2.2, but still available
    - restriction in updateSubjectPresentation requiring previous call to addSubjectPresentation removed,
      can anchor directly to any user valid State.
    - Deprecated subjectPresentationListRegistry mapping and corresponding getter function getSubjectPresentationList
      removed all wrrite and read access to subjectPresentationListRegistry mapping.
    - Deprecated URI field in SubjectPresentations Struct.
      The corresponding parameter in addSubjectPresentation is kept, but not used at all in the implementation.
      The name of the parameter has been deprecated (commented out) to avoid Solidity compiler warnings about unused parameter.
    */

    // Subject Presentation actions are registered under subjectPresentationHash = hash(complete JWTPresentation & subjectDID)
    // in a (subject, subjectPresentationHash) mapping
    // Receiver (ussually a Service Provider) Presentation Actions are registered
    // under receiverPresentationHash = hash(complete JWTPresentation & receiverDID) in a (receiver, receiverPresentationHash) mapping

    /* Deprecated
    // A List of Subject Presentation Hashes is gathered in a (subject) mapping
    // To Review: Subject Presentations  could be iterated instead of returned as an array
    */

    // Variables
    int public version;
    address public previousPublishedVersion;

    // Status definition, should be moved to a Library.
    enum Status {Valid, Received, AskDeletion, DeletionConfirmation}
    Status constant STATUS_FIRST = Status.Valid;
    Status constant STATUS_LAST = Status.DeletionConfirmation;

	// AlastriaID V2.1: Beware Open Zepelin does not support Global Variables, added Constant 
    bool constant backTransitionsAllowed = false;

    // Presentation Status
    // Updates as allowed in *allow functions
    struct SubjectPresentation {
        bool exists;
        Status status;
        /*Deprecated string URI; */
    }

    // Mapping subject, subjectPresentationHash (Complete JWT Presentation + subjectDID)
    mapping(address => mapping(bytes32 => SubjectPresentation)) private subjectPresentationRegistry;
    /*Deprecated mapping(address => bytes32[]) private subjectPresentationListRegistry; */

    struct ReceiverPresentation {
        bool exists;
        Status status;
    }

    // Mapping receiver, receiverPresentationHash (Complete JWT Presentation + ReceiverDID)
    mapping(address => mapping(bytes32 => ReceiverPresentation)) private receiverPresentationRegistry;

    // Events. Just for changes, not for initial set
    event PresentationUpdated (bytes32 hash, Status status);

    //Modifiers
    modifier validAddress(address addr) {//protects against some weird attacks
        require(addr != address(0));
        _;
    }

    modifier validStatus (Status status) { // solidity currently check on use not at function call
        require (status >= STATUS_FIRST && status <= STATUS_LAST);
        _;
    }

    // Functions
    function initialize(address _previousPublishedVersion) public initializer {
        version = 4;
        previousPublishedVersion = _previousPublishedVersion;
    }

    // Status validations
    function getSubjectAllowed(Status status) private pure returns (bool){
        return status == Status.Valid || status == Status.AskDeletion;
    }

    function getReceiverAllowed(Status status) private pure returns (bool){
        return status == Status.Received || status == Status.DeletionConfirmation;
    }

    //Subject functions
	//To be deprecated, please use only new updateSubjectPresentation
    function addSubjectPresentation(bytes32 subjectPresentationHash, string memory /*Deprecated parameter URI not used */) public {
        require(!subjectPresentationRegistry[msg.sender][subjectPresentationHash].exists);
        subjectPresentationRegistry[msg.sender][subjectPresentationHash] = SubjectPresentation(true, Status.Valid /*Deprecated, URI*/);
        /*Deprecated subjectPresentationListRegistry[msg.sender].push(subjectPresentationHash); */
    }

	// AlastriaID V2.1: removed restriction that the Presentation registry must exist before calling update
    function updateSubjectPresentation(bytes32 subjectPresentationHash, Status status) public validStatus(status) {
        // Check valid status
        if (getSubjectAllowed(status)) {
            SubjectPresentation storage value = subjectPresentationRegistry[msg.sender][subjectPresentationHash];
            // If it does not exist, we create a new entry
            if (!value.exists) {
                subjectPresentationRegistry[msg.sender][subjectPresentationHash] = SubjectPresentation(true, status /*Deprecated , ""*/);
                /*Deprecated subjectPresentationListRegistry[msg.sender].push(subjectPresentationHash); */
                emit PresentationUpdated(subjectPresentationHash, status);
            }
            // if backward transition allowed or new status higher than previous status, update entry in the mapping
            else if (backTransitionsAllowed || status > value.status) {
                value.status = status;
                emit PresentationUpdated(subjectPresentationHash, status);
            }
        }
    }

    // If the Presentation does not exists the return is a void Presentation
    // If we want a log, should we add an event?
    function getSubjectPresentationStatus(address subject, bytes32 subjectPresentationHash) view public validAddress(subject) returns (bool exists, Status status) {
        SubjectPresentation storage value = subjectPresentationRegistry[subject][subjectPresentationHash];
        return (value.exists, value.status);
    }

    /*Deprecated
    function getSubjectPresentationList(address subject) public view returns (uint, bytes32[] memory) {
        return (subjectPresentationListRegistry[subject].length, subjectPresentationListRegistry[subject]);
    }
    */

    //Receiver functions
    function updateReceiverPresentation(bytes32 receiverPresentationHash, Status status) public validStatus(status) {
        // Check valid status
        if (getReceiverAllowed(status)) {
            ReceiverPresentation storage value = receiverPresentationRegistry[msg.sender][receiverPresentationHash];
            // If it does not exist, we create a new entry
            if (!value.exists) {
                receiverPresentationRegistry[msg.sender][receiverPresentationHash] = ReceiverPresentation(true, status);
                emit PresentationUpdated(receiverPresentationHash, status);
            }
            // if backward transition allowed or new status higher than previous status, update entry in the mapping
            else if (backTransitionsAllowed || status > value.status) {
                value.status = status;
                emit PresentationUpdated(receiverPresentationHash, status);
            }
        }
    }

    // If the Presentation does not exists the return is a void Presentation
    function getReceiverPresentationStatus(address receiver, bytes32 receiverPresentationHash) view public validAddress(receiver) returns (bool exists, Status status) {
        ReceiverPresentation storage value = receiverPresentationRegistry[receiver][receiverPresentationHash];
        return (value.exists, value.status);
    }

    // Utility function. To be deprecated. 
    // This utility function combining two status should be implemented in the library and not in a smart contracts
    // Defining three status functions avoids linking the Subject to the Receiver or the corresponding hashes
    function getPresentationStatus(Status subjectStatus, Status receiverStatus) pure public validStatus(subjectStatus) validStatus(receiverStatus) returns (Status){
        if (subjectStatus >= receiverStatus) {
            return subjectStatus;
        } else {
            return receiverStatus;
        }
    }
}
