import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import SealableServiceArtifacts from '../node_modules/open-smartkit/build/contracts/Sealable.json'
import { default as contract } from 'truffle-contract';
import getWeb3 from './utils/getWeb3'
import logo from './img/logo.svg';
import noImage from './img/no_image.png';
import './App.css';

var qr = require('qr-image')
let SealableService = contract(SealableServiceArtifacts)

class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      registrationNumber: '',
      studentFirstname: '',
      studentLastname: '',
      studentBirthDate: '',
      studentGraduationDate : '',
      studentDegreeLabel : '',
      contractAddress :'0x8e1fcbfc6760444bf66e26c19f0ded0c71ef8bc6',
      isSettingsModalVisible : false,
      web3: null
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  render() {
    return (
      <div className="App">
        { this.renderHeader() }
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              Smart degree aims to provide a decentralized solution to manage degree. The main idea is for a school, or any entity managing diplomas, to store diplomas validation proof on a blockchain system.
              <div className="row">
                <div className="col-xs-8 col-sm-6">
                  { this.renderForm() }
                </div>
                <div className="col-xs-8 col-sm-6">
                  { this.renderQrCodeView() }
                </div>
              </div>
              { this.renderAlertMessage() }
              { this.renderSubmitButton() }
            </div>
          </div>
          { this.renderSettingsModal() }
        </div>
      </div>
    );
  }

  renderHeader = () => {
    return <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <h1>Smart degree dapp web</h1>

    </header>
  }

  renderForm = () => {
    return  <form>
        <div className="form-group form-inline">
          <label>Registration number &nbsp;</label>
          <input type="text" className="form-control" name="registrationNumber" value={this.state.registrationNumber}
            onChange={this.handleChange.bind(this)}/>
        </div>
        <div className="form-group form-inline">
          <label>Student Firstname &nbsp;</label>
          <input type="text" className="form-control" name="studentFirstname" value={this.state.studentFirstname}
            onChange={this.handleChange.bind(this)}/>
        </div>
        <div className="form-group form-inline">
          <label>Student Lastname &nbsp;</label>
          <input type="text" className="form-control" name="studentLastname" value={this.state.studentLastname}
            onChange={this.handleChange.bind(this)}/>
        </div>
        <div className="form-group form-inline">
          <label>Birthday &nbsp;</label>
          <input type="date" className="form-control" name="studentBirthDate" value={this.state.studentBirthDate}
            onChange={this.handleChange.bind(this)}/>
        </div>
        <div className="form-group form-inline">
          <label>Graduation date &nbsp;</label>
          <input type="date" className="form-control" name="studentGraduationDate" value={this.state.studentGraduationDate}
            onChange={this.handleChange.bind(this)}/>
        </div>
        <div className="form-group form-inline">
          <label>Degree Label &nbsp;</label>
          <input type="text" className="form-control" name="studentDegreeLabel" value={this.state.studentDegreeLabel}
            onChange={this.handleChange.bind(this)}/>
        </div>
      </form>
  }

  renderSubmitButton = () => {
    return  <div className="btn-group">
      &nbsp;
      <button type="submit" onClick={this.registerDegree.bind(this)} className="btn btn-primary">Register</button>
      &nbsp;
      <button type="submit" onClick={this.verifyDegree.bind(this)} className="btn btn-primary">Verify</button>
      &nbsp;
      <button type="submit" onClick={this.toggleSettingsModelVisibility.bind(this)} className="btn btn-default">Settings</button>
    </div>
  }

  renderSettingsModal = () => {
    return <div>
        <Modal isOpen={this.state.isSettingsModalVisible} toggle={this.toggleSettingsModelVisibility.bind(this)}>
          <ModalHeader toggle={this.toggleSettingsModelVisibility.bind(this)}>Settings</ModalHeader>
          <ModalBody>
            <form>
                <div class="form-group form-inline">
                  <label for="contractAddress">Contract address &nbsp;</label>
                  <input type="text" class="form-control" name="contractAddress" value={this.state.contractAddress}
                    onChange={this.handleChange.bind(this)}/>
                </div>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button onClick={this.toggleSettingsModelVisibility.bind(this)}>Close</Button>
          </ModalFooter>
        </Modal>
      </div>
  }

  renderAlertMessage = () => {
    if(this.state.verifySealResult===true){
      return <div className="alert alert-success" role="alert">
          This degree is valid
        </div>
    }else if(this.state.verifySealResult===false){
        return <div className="alert alert-danger" role="alert">
            This degree is not valid
        </div>
    }
  }

  renderQrCodeView = () => {
    return 	<img src={noImage} id="verify-qrcode" height="300" alt="qrcode"/>
  }

  /**** COMMON ACTION ****/

  handleSubmit(event) {
    event.preventDefault();
  }

  /****** HISTORICAL POSITION ACTION *******/

  handleChange(event) {
    const name = event.target.name;
    this.setState({
      [name]: event.target.value
    })
  }

  toggleSettingsModelVisibility() {
    this.setState({
      isSettingsModalVisible: !this.state.isSettingsModalVisible
    })
  }

  registerDegree() {
    SealableService.setProvider(this.state.web3.currentProvider);
      var sealableInstance;
      this.state.web3.eth.getAccounts((error, accounts) => {
        SealableService.at(this.state.contractAddress).then((instance) => {
          sealableInstance = instance
          let inputHash = this.state.registrationNumber
            .concat(this.state.studentFirstname)
            .concat(this.state.studentLastname)
            .concat(this.state.studentBirthDate)
            .concat(this.state.studentGraduationDate)
            .concat(this.state.studentDegreeLabel)

          console.log("hash input : ", inputHash);
          console.log("registrationNumber input : ", this.state.registrationNumber);

          let degreeHash = window.web3.sha3(inputHash);
          let degreeId = window.web3.sha3(this.state.registrationNumber);

          console.log("degreeId generated : ", degreeId);
          console.log("degreeHash : ", degreeHash);

          return sealableInstance.recordSeal(
            degreeId,
            degreeHash,
            {from: accounts[0]}
          ).then((result) => {
            console.log("recordSeal : ", result);
            this.generateQrCode()
          })
        })
      })
   }


   generateQrCode() {
      var targetUrl = window.location+"verifyEndpoint.html?registrationNumber="+this.state.registrationNumber+"&studentFirstname="+this.state.studentFirstname+
      "&studentSurname="+this.state.studentLastname+"&studentBirthDate="+this.state.studentBirthDate+"&degreeLabel="+this.state.studentDegreeLabel+"&graduationDate="+this.state.studentGraduationDate+
      "&address="+this.state.contractAddress
      console.log("target qrCode : " + targetUrl)
      var code = qr.imageSync(targetUrl, { type: 'png' });
      var base64Data = btoa(String.fromCharCode.apply(null, code));
      document.getElementById("verify-qrcode").src = 'data:image/png;base64,'+ base64Data;
   }


   verifyDegree() {
     SealableService.setProvider(this.state.web3.currentProvider);
       var sealableInstance;
       SealableService.at(this.state.contractAddress).then((instance) => {
         sealableInstance = instance
         let inputHash = this.state.registrationNumber
           .concat(this.state.studentFirstname)
           .concat(this.state.studentLastname)
           .concat(this.state.studentBirthDate)
           .concat(this.state.studentGraduationDate)
           .concat(this.state.studentDegreeLabel)

         console.log("hash input : ", inputHash);
         console.log("registrationNumber input : ", this.state.registrationNumber);

         let degreeHash = window.web3.sha3(inputHash);
         let degreeId = window.web3.sha3(this.state.registrationNumber);

         console.log("degreeId generated : ", degreeId);
         console.log("degreeHash : ", degreeHash);

         return sealableInstance.verifySeal(
           degreeId,
           degreeHash
         ).then((result) => {
           console.log("verifySeal : ", result);
           this.setState({
             verifySealResult: result
           })
         })
      })
    }
}

export default App;
