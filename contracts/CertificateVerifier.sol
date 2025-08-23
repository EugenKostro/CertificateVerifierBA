// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateVerifier {
    mapping(string => bool) public certificates;
    string[] private allCertificates;

    event CertificateAdded(string certId);
    event CertificateRemoved(string certId);

    function addCertificate(string memory certId) public {
        require(!certificates[certId], "Certifikat vec postoji");
        certificates[certId] = true;
        allCertificates.push(certId);
        emit CertificateAdded(certId);
    }

    function verifyCertificate(string memory certId) public view returns (bool) {
        return certificates[certId];
    }

    function removeCertificate(string memory certId) public {
        require(certificates[certId], "Certifikat NE postoji");
        certificates[certId] = false;
        emit CertificateRemoved(certId);
    }

    function getAllCertificates() public view returns (string[] memory) {
        return allCertificates;
    }
}
