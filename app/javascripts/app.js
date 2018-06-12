// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';
import { default as ethUtil} from 'ethereumjs-util';
import { default as sigUtil} from 'eth-sig-util';
/*
 * When you compile and deploy your Voting contract,
 * truffle stores the abi and deployed address in a json
 * file in the build directory. We will use this information
 * to setup a Voting abstraction. We will use this abstraction
 * later to create an instance of the Voting contract.
 * Compare this against the index.js from our previous tutorial to see the difference
 * https://gist.github.com/maheshmurthy/f6e96d6b3fff4cd4fa7f892de8a1a1b4#file-index-js
 */
 

var qr = require('qr-image')
import smart_degree_artifacts from '../../build/contracts/SmartDegree.json'
var SmartDegree = contract(smart_degree_artifacts);
var ipAddress = "http://86.237.175.218"
var contractAddress

/*const publicIp = require('public-ip');

publicIp.v4().then(ip => {
	console.log(ip);
	ipAddress = ip
	//=> '46.5.21.123'
});
*/

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
    console.warn("No web3 detected. Falling back to "+ipAddress+". You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    //$("#verify-result").html("No web3 detected.")
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider(ipAddress+":8545"));
  }
  SmartDegree.setProvider(web3.currentProvider);

    SmartDegree.deployed().then(function(contractInstance) {
      contractAddress = contractInstance.address
    });


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

    let inputHash = data["registrationNumber"].concat(["datastudentFirstname"]).concat(data["studentSurname"]).concat(data["studentBirthDate"]).concat(data["graduationDate"]).concat(data["degreeLabel"])
    console.log("hash input : ", inputHash);
    console.log("registrationNumber input : ", data["registrationNumber"]);
    let degreeHash = window.web3.sha3(inputHash);
    let degreeId = window.web3.sha3(data["registrationNumber"]);

    SmartDegree.deployed().then(function(contractInstance) {
        console.log("wallet used : ", web3.eth.accounts[0])
        contractInstance.addDegreeHash(degreeId,degreeHash, {gas: 140000, from: web3.eth.accounts[0]});
    }).then(function(status) {
         var targetUrl = ipAddress+":8080/verifyEndpoint.html?registrationNumber="+data["registrationNumber"]+"&studentFirstname="+data["studentFirstname"]+
        "&studentSurname="+data["studentSurname"]+"&studentBirthDate="+data["studentBirthDate"]+"&degreeLabel="+data["degreeLabel"]+"&graduationDate="+data["graduationDate"]+"&address="+contractAddress
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

    console.log(inputHash)
    console.log(degreeHash)

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

    SmartDegree.deployed().then(function(contractInstance) {
        return contractInstance.verify(degreeId, degreeHash);
    }).then(function(result) {
	
		var resultImg
		
		console.log(result)
		
        if(result === true){
			resultImg = "valid.png"
        }else{
			resultImg = "invalid.png"
        }
        document.getElementById("resultImg").src = resultImg

        $("#registrationNumber").text(data.registrationNumber)
        $("#studentFirstname").text(data.studentFirstname)
        $("#studentSurname").text(data.studentSurname)
        $("#studentBirthDate").text(data.studentBirthDate)
        $("#graduationDate").text(data.graduationDate)
        $("#degreeLabel").text(data.degreeLabel)
    })
}

function checkAndStore(label, data){
	if($("#"+label).val() === '')
		return false
	data[label] = $("#"+label).val()
	return true	
}
