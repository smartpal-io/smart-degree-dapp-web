pragma solidity ^0.4.11;

import "../node_modules/zeppelin-solidity/contracts/ownership/Whitelist.sol";

/**
 * @title SmartDegree
 * @dev SmartDegree ....
 */
contract SmartDegree is Whitelist {

  mapping (bytes32 => bytes32) private hashList_;

  event DegreeHashAdded(bytes32 indexed id, bytes32 indexed hash);


  /**
   * @notice Create a new SmartDegree Contract.
   */
  function SmartDegree() public {
    addAddressToWhitelist(msg.sender);
  }

  /**
   * @notice Register a new delegate authorized to add degree
   */
  function registerDelegate(address delegate) onlyOwner public returns(bool success) {  
	return addAddressToWhitelist(delegate);
  }
  
  /**
   * @notice Add a new DegreeHash to the contract.
   */
  function addDegreeHash(bytes32 id, bytes32 hash) public onlyWhitelisted {
     require(hashList_[id] == bytes32(0x0));
     hashList_[id]=hash;
     emit DegreeHashAdded(id,hash);
  }

  /**
   * Use these getter functions to access the degree hash
   * @param id of the degree
   * @return hash of the degree to verify
   */
  function getHash(bytes32 id) public view returns(bytes32) {
    return hashList_[id];
  }

  /**
   * Use these method functions to verify a degree hash
   * @param id of the degree
   * @param hash of the degree to verify
   */
  function verify(bytes32 id, bytes32 hash) public view returns(bool) {
    return hashList_[id]==hash;
  }

}
