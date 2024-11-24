# DSA-5798-1

package: 
## summary
activemq - security update## score
## Details



# CVE-2017-17529

package: 
## summary
## score
type: CVSS_V3
score: 
## Details
af/util/xp/ut_go_file.cpp in AbiWord 3.0.2-2 does not validate strings before launching the program specified by the BROWSER environment variable, which might allow remote attackers to conduct argument-injection attacks via a crafted URL.


# CVE-2016-5416

package: 
## summary
## score
type: CVSS_V3
score: 
## Details
389 Directory Server in Red Hat Enterprise Linux Desktop 6 through 7, Red Hat Enterprise Linux HPC Node 6 through 7, Red Hat Enterprise Linux Server 6 through 7, and Red Hat Enterprise Linux Workstation 6 through 7 allows remote attackers to read the default Access Control Instructions.


# CVE-2024-1062

package: 
## summary
## score
## Details
A heap overflow flaw was found in 389-ds-base. This issue leads to a denial of service when writing a value larger than 256 chars in log_entry_attr.


# DSA-5729-2

package: 
## summary
apache2 - regression update## score
## Details



# CVE-2022-41678

package: 
## summary
## score
type: CVSS_V3
score: 
## Details
Once an user is authenticated on Jolokia, he can potentially trigger arbitrary code execution. 

In details, in ActiveMQ configurations, jetty allows
org.jolokia.http.AgentServlet to handler request to /api/jolokia

org.jolokia.http.HttpRequestHandler#handlePostRequest is able to
create JmxRequest through JSONObject. And calls to
org.jolokia.http.HttpRequestHandler#executeRequest.

Into deeper calling stacks,
org.jolokia.handler.ExecHandler#doHandleRequest can be invoked
through refection. This could lead to RCE through via
various mbeans. One example is unrestricted deserialization in jdk.management.jfr.FlightRecorderMXBeanImpl which exists on Java version above 11.

1 Call newRecording.

2 Call setConfiguration. And a webshell data hides in it.

3 Call startRecording.

4 Call copyTo method. The webshell will be written to a .jsp file.

The mitigation is to restrict (by default) the actions authorized on Jolokia, or disable Jolokia.
A more restrictive Jolokia configuration has been defined in default ActiveMQ distribution. We encourage users to upgrade to ActiveMQ distributions version including updated Jolokia configuration: 5.16.6, 5.17.4, 5.18.0, 6.0.0.



# CVE-2023-46604

package: 
## summary
## score
type: CVSS_V3
score: 
## Details
The Java OpenWire protocol marshaller is vulnerable to Remote Code 
Execution. This vulnerability may allow a remote attacker with network 
access to either a Java-based OpenWire broker or client to run arbitrary
 shell commands by manipulating serialized class types in the OpenWire 
protocol to cause either the client or the broker (respectively) to 
instantiate any class on the classpath.

Users are recommended to upgrade
 both brokers and clients to version 5.15.16, 5.16.7, 5.17.6, or 5.18.3 
which fixes this issue.




# CVE-2020-1734

package: 
## summary
## score
type: CVSS_V3
score: 
## Details
A flaw was found in the pipe lookup plugin of ansible. Arbitrary commands can be run, when the pipe lookup plugin uses subprocess.Popen() with shell=True, by overwriting ansible facts and the variable is not escaped by quote plugin. An attacker could take advantage and run arbitrary commands by overwriting the ansible facts.


# CVE-2023-31102

package: 
## summary
## score
type: CVSS_V3
score: 
## Details
Ppmd7.c in 7-Zip before 23.00 allows an integer underflow and invalid read operation via a crafted 7Z archive.


# CVE-2024-2199

package: 
## summary
## score
## Details
A denial of service vulnerability was found in 389-ds-base ldap server. This issue may allow an authenticated user to cause a server crash while modifying `userPassword` using malformed input.


# CVE-2020-1736

package: 
## summary
## score
type: CVSS_V3
score: 
## Details
A flaw was found in Ansible Engine when a file is moved using atomic_move primitive as the file mode cannot be specified. This sets the destination files world-readable if the destination file does not exist and if the file exists, the file could be changed to have less restrictive permissions before the move. This could lead to the disclosure of sensitive data. All versions in 2.7.x, 2.8.x and 2.9.x branches are believed to be vulnerable.


# CVE-2023-1055

package: 
## summary
## score
type: CVSS_V3
score: 
## Details
A flaw was found in RHDS 11 and RHDS 12. While browsing entries LDAP tries to decode the userPassword attribute instead of the userCertificate attribute which could lead into sensitive information leaked. An attacker with a local account where the cockpit-389-ds is running can list the processes and display the hashed passwords. The highest threat from this vulnerability is to data confidentiality.


# CVE-2024-8445

package: 
## summary
## score
## Details
The fix for CVE-2024-2199 in 389-ds-base was insufficient to cover all scenarios. In certain product versions, an authenticated user may cause a server crash while modifying `userPassword` using malformed input.


# CVE-2024-6237

package: 
## summary
## score
type: CVSS_V3
score: 
## Details
A flaw was found in the 389 Directory Server. This flaw allows an unauthenticated user to cause a systematic server crash while sending a specific extended search request, leading to a denial of service.


# CVE-2024-5953

package: 
## summary
## score
## Details
A denial of service vulnerability was found in the 389-ds-base LDAP server. This issue may allow an authenticated user to cause a server denial of service while attempting to log in with a user with a malformed hash in their password.


# CVE-2023-45196

package: 
## summary
## score
## Details
Adminer and AdminerEvo allow an unauthenticated remote attacker to cause a denial of service by connecting to an attacker-controlled service that responds with HTTP redirects. The denial of service is subject to PHP configuration limits. Adminer is no longer supported, but this issue was fixed in AdminerEvo version 4.8.4.


# CVE-2023-45195

package: 
## summary
## score
## Details
Adminer and AdminerEvo are vulnerable to SSRF via database connection fields. This could allow an unauthenticated remote attacker to enumerate or access systems the attacker would not otherwise have access to. Adminer is no longer supported, but this issue was fixed in AdminerEvo version 4.8.4.


# CVE-2020-1738

package: 
## summary
## score
type: CVSS_V3
score: 
## Details
A flaw was found in Ansible Engine when the module package or service is used and the parameter 'use' is not specified. If a previous task is executed with a malicious user, the module sent can be selected by the attacker using the ansible facts file. All versions in 2.7.x, 2.8.x and 2.9.x branches are believed to be vulnerable.


# CVE-2024-3657

package: 
## summary
## score
## Details
A flaw was found in 389-ds-base. A specially-crafted LDAP query can potentially cause a failure on the directory server, leading to a denial of service


# CVE-2014-1935

package: 
## summary
## score
type: CVSS_V3
score: 
## Details
9base 1:6-6 and 1:6-7 insecurely creates temporary files which results in predictable filenames.


# CVE-2024-9902

package: 
## summary
## score
type: CVSS_V3
score: 
## Details
A flaw was found in Ansible. The ansible-core `user` module can allow an unprivileged user to silently create or replace the contents of any file on any system path and take ownership of it when a privileged user executes the `user` module against the unprivileged user's home directory. If the unprivileged user has traversal permissions on the directory containing the exploited target file, they retain full control over the contents of the file as its owner.


# CVE-2024-11079

package: 
## summary
## score
type: CVSS_V3
score: 
## Details
A flaw was found in Ansible-Core. This vulnerability allows attackers to bypass unsafe content protections using the hostvars object to reference and execute templated content. This issue can lead to arbitrary code execution if remote data or module outputs are improperly templated within playbooks.


# CVE-2024-8775

package: 
## summary
## score
## Details
A flaw was found in Ansible, where sensitive information stored in Ansible Vault files can be exposed in plaintext during the execution of a playbook. This occurs when using tasks such as include_vars to load vaulted variables without setting the no_log: true parameter, resulting in sensitive data being printed in the playbook output or logs. This can lead to the unintentional disclosure of secrets like passwords or API keys, compromising security and potentially allowing unauthorized access or actions.


# CVE-2021-42522

package: 
## summary
## score
type: CVSS_V3
score: 
## Details
There is a Information Disclosure vulnerability in anjuta/plugins/document-manager/anjuta-bookmarks.c. This issue was caused by the incorrect use of libxml2 API. The vendor forgot to call 'g_free()' to release the return value of 'xmlGetProp()'.


# CVE-2024-30187

package: 
## summary
## score
## Details
Anope before 2.0.15 does not prevent resetting the password of a suspended account.


# CVE-2023-52168

package: 
## summary
## score
## Details
The NtfsHandler.cpp NTFS handler in 7-Zip before 24.01 (for 7zz) contains a heap-based buffer overflow that allows an attacker to overwrite two bytes at multiple offsets beyond the allocated buffer size: buffer+512*i-2, for i=9, i=10, i=11, etc.


# CVE-2023-40481

package: 
## summary
## score
## Details
7-Zip SquashFS File Parsing Out-Of-Bounds Write Remote Code Execution Vulnerability. This vulnerability allows remote attackers to execute arbitrary code on affected installations of 7-Zip. User interaction is required to exploit this vulnerability in that the target must visit a malicious page or open a malicious file.

The specific flaw exists within the parsing of SQFS files. The issue results from the lack of proper validation of user-supplied data, which can result in a write past the end of an allocated buffer. An attacker can leverage this vulnerability to execute code in the context of the current process. Was ZDI-CAN-18589.


# CVE-2023-52169

package: 
## summary
## score
## Details
The NtfsHandler.cpp NTFS handler in 7-Zip before 24.01 (for 7zz) contains an out-of-bounds read that allows an attacker to read beyond the intended buffer. The bytes read beyond the intended buffer are presented as a part of a filename listed in the file system image. This has security relevance in some known web-service use cases where untrusted users can upload files and have them extracted by a server-side 7-Zip process.


