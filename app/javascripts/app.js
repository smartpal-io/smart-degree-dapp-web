// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';
import { default as ethUtil} from 'ethereumjs-util';
import { default as sigUtil} from 'eth-sig-util';


var qr = require('qr-image')
import smart_degree_artifacts from '../../build/contracts/SmartDegree.json'
var SmartDegree = contract(smart_degree_artifacts);


window.registerDegree = function(student) {
	
	var data = []
	
	if(!checkAndStore("registrationNumber", data))return;
	if(!checkAndStore("studentFirstname", data))return;
	if(!checkAndStore("studentSurname", data))return;
	if(!checkAndStore("studentBirthDate", data))return;
	if(!checkAndStore("graduationDate", data))return;
	if(!checkAndStore("degreeLabel", data))return;
	
		
	console.log(data)
	registerDegree(data)
	
}

window.verifyDegree = function(student) {
	
	var data = []
	
	if(!checkAndStore("registrationNumber", data))return;
	if(!checkAndStore("studentFirstname", data))return;
	if(!checkAndStore("studentSurname", data))return;
	if(!checkAndStore("studentBirthDate", data))return;
	if(!checkAndStore("graduationDate", data))return;
	if(!checkAndStore("degreeLabel", data))return;
	
    verifyDegree(data)
}

$( document ).ready(function() {
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source like Metamask")
    //$("#verify-result").html("Using web3 detected from external source like Metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);

  } else {
    console.warn("No web3 detected. Falling back to "+process.env.PUBLIC_IP+":"+process.env.RPC_PORT+". You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    //$("#verify-result").html("No web3 detected.")
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider(process.env.PUBLIC_IP+":"+process.env.RPC_PORT));
  }
  SmartDegree.setProvider(web3.currentProvider);

   if($("#verify-endpoint").is(':visible')){
    var params = getSearchParameters();
        console.log("verify-endpoint")

        var data = {
            registrationNumber: params.registrationNumber,
            studentFirstname: params.studentFirstname,
            studentSurname: params.studentSurname,
            studentBirthDate: params.studentBirthDate,
            graduationDate: params.graduationDate,
            degreeLabel: params.degreeLabel,
        };
        verifyAndDisplayDegree(data)
   }
});


function getSearchParameters() {
      var prmstr = window.location.search.substr(1);
      return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

function transformToAssocArray( prmstr ) {
    var params = {};
    var prmarr = prmstr.split("&");
    for ( var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
}

function registerDegree(data) {
	$("#result").html("")
	document.getElementById("resultImg").src = ""

    console.log("registerDegree")

    let inputHash = data["registrationNumber"].concat(data["studentFirstname"]).concat(data["studentSurname"]).concat(data["studentBirthDate"]).concat(data["graduationDate"]).concat(data["degreeLabel"])
    let degreeHash = window.web3.sha3(inputHash);
    let degreeId = window.web3.sha3(data["registrationNumber"]);
	
	console.log("degreeId : " + degreeId)
	console.log("degreeHash : " + degreeHash)

    SmartDegree.deployed().then(function(contractInstance) {
        console.log("wallet used : ", web3.eth.accounts[0])
        contractInstance.addDegreeHash(degreeId,degreeHash, {gas: 140000, from: web3.eth.accounts[0]});
    }).then(function(status) {
         var targetUrl = process.env.PUBLIC_IP+":"+process.env.HTTP_PORT+"/verifyEndpoint.html?registrationNumber="+data["registrationNumber"]+"&studentFirstname="+data["studentFirstname"]+
        "&studentSurname="+data["studentSurname"]+"&studentBirthDate="+data["studentBirthDate"]+"&degreeLabel="+data["degreeLabel"]+"&graduationDate="+data["graduationDate"]+"&address="+process.env.CONTRACT_ADDRESS
        console.log("target qrCode : " + targetUrl)
        var code = qr.imageSync(targetUrl, { type: 'png' });
        var base64Data = btoa(String.fromCharCode.apply(null, code));
        document.getElementById("verify-qrcode").src = 'data:image/png;base64,'+ base64Data;
    });
}

function verifyDegree(data) {
    console.log("verifyDegree")
    console.log(data)

    let inputHash = data["registrationNumber"].concat(data["studentFirstname"]).concat(data["studentSurname"]).concat(data["studentBirthDate"]).concat(data["graduationDate"]).concat(data["degreeLabel"])
    let degreeHash = window.web3.sha3(inputHash);
    let degreeId = window.web3.sha3(data["registrationNumber"]);

    console.log("degreeId : " + degreeId)
    console.log("degreeHash : " + degreeHash)

    SmartDegree.deployed().then(function(contractInstance) {
        return contractInstance.verify(degreeId, degreeHash);
    }).then(function(result) {
     
		var resultImg
		
		if(result === true){
			resultImg = "valid.png"
        }else{
			resultImg = "invalid.png"
        }
		document.getElementById("resultImg").src = resultImg
    })
}

function verifyAndDisplayDegree(data) {
    console.log("verifyDegree")
    console.log(data)

    let inputHash = data.registrationNumber.concat(data.studentFirstname).concat(data.studentSurname).concat(data.studentBirthDate).concat(data.graduationDate).concat(data.degreeLabel)
    let degreeHash = window.web3.sha3(inputHash);
    let degreeId = window.web3.sha3(data.registrationNumber);

    console.log(inputHash)
    console.log(degreeHash)
	
	$("#registrationNumber").text(data.registrationNumber)
	$("#studentFirstname").text(data.studentFirstname)
	$("#studentSurname").text(data.studentSurname)
	$("#studentBirthDate").text(data.studentBirthDate)
	$("#graduationDate").text(data.graduationDate)
	$("#degreeLabel").text(data.degreeLabel)

    SmartDegree.deployed().then(function(contractInstance) {
        return contractInstance.verify(degreeId, degreeHash);
    }).then(function(result) {
	
		var resultImg
		
        if(result === true){
			resultImg = "valid.png"
        }else{
			resultImg = "invalid.png"
        }
        document.getElementById("resultImg").src = resultImg
    })
}

function checkAndStore(label, data){
	if($("#"+label).val() === '')
		return false
	data[label] = $("#"+label).val()
	return true	
}
