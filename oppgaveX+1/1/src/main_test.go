package main

import (
	"fmt"
	"testing"
)

func TestParseAzureFlowLine(t *testing.T) {
	line := `{"records":[{"time":"2024-11-07T16:00:00Z","systemId":"12345678-abcd-1234-efgh-1234567890ab","category":"NetworkSecurityGroupFlowEvent","resourceId":"/SUBSCRIPTIONS/11111111-2222-3333-4444-555555555555/RESOURCEGROUPS/ExampleResourceGroup/PROVIDERS/MICROSOFT.NETWORK/NETWORKSECURITYGROUPS/ExampleNSG","operationName":"NetworkSecurityGroupFlowEvents","properties":{"Version":1,"flows":[{"rule":"AllowWebTraffic","flows":[{"mac":"000D3A1B2C3D","flowTuples":["1730991600,10.0.0.5,40.90.2.1,12345,80,T,O,A,B","1730991601,40.90.2.1,10.0.0.5,80,12345,T,I,A,B","1730991602,10.0.0.5,13.89.1.2,12346,443,T,O,A,B","1730991603,13.89.1.2,10.0.0.5,443,12346,T,I,A,B"]}]},{"rule":"AllowInternal","flows":[{"mac":"000D3A1B2C3D","flowTuples":["1730991606,10.0.0.5,10.0.0.6,5678,1433,T,O,A,B","1730991607,10.0.0.6,10.0.0.5,1433,5678,T,I,A,B"]}]}]}}]}`
	wantedResults := []normalizedLog{
		{timestamp: "1730991600", src_ip: "10.0.0.5", dst_ip: "40.90.2.1", src_port: "12345", dst_port: "80", protocol: "T"},
		{timestamp: "1730991601", src_ip: "40.90.2.1", dst_ip: "10.0.0.5", src_port: "80", dst_port: "12345", protocol: "T"},
		{timestamp: "1730991602", src_ip: "10.0.0.5", dst_ip: "13.89.1.2", src_port: "12346", dst_port: "443", protocol: "T"},
		{timestamp: "1730991603", src_ip: "13.89.1.2", dst_ip: "10.0.0.5", src_port: "443", dst_port: "12346", protocol: "T"},
		{timestamp: "1730991606", src_ip: "10.0.0.5", dst_ip: "10.0.0.6", src_port: "5678", dst_port: "1433", protocol: "T"},
		{timestamp: "1730991607", src_ip: "10.0.0.6", dst_ip: "10.0.0.5", src_port: "1433", dst_port: "5678", protocol: "T"},
	}

	results := parseAzureFlowLine(line)

	if len(results) != len(wantedResults) {
		t.Fatalf("parseAzureFlowLine should give %d normalized logs, but gave %d", len(wantedResults), len(results))
	}

	for i := range results {
		compareResult, mismatch := compareNormalizedLogs(results[i], wantedResults[i])
		if !compareResult {
			t.Fatalf(mismatch)
		}
	}
}

func TestParseCorelightLine(t *testing.T) {
	line := `{"ts": "2024-11-07T07:55:00-05:00", "uid": "C1ZABC2XYZ001", "id.orig_h": "10.0.0.1", "id.orig_p": 12345, "id.resp_h": "93.184.216.34", "id.resp_p": 80, "proto": "tcp", "service": "http", "duration": 1.234, "orig_bytes": 512, "resp_bytes": 2048, "conn_state": "SF", "missed_bytes": 0, "history": "ShADadFf", "orig_pkts": 10, "orig_ip_bytes": 1500, "resp_pkts": 15, "resp_ip_bytes": 3000}`
	wantedResult := normalizedLog{
		timestamp:  "2024-11-07T07:55:00-05:00",
		src_ip:     "10.0.0.1",
		dst_ip:     "93.184.216.34",
		src_port:   "12345",
		dst_port:   "80",
		protocol:   "tcp",
		sourceType: "",
	}
	results := parseCorelightLine(line)

	if len(results) != 1 {
		t.Fatalf("result for parsing corelight logs should be only 1 normalized log, got %d", len(results))
	}

	result := results[0]

	compareResult, mismatch := compareNormalizedLogs(wantedResult, result)

	if !compareResult {
		t.Fatalf(mismatch)
	}
}

func TestParseTcpDumpLine(t *testing.T) {
	line := `2024-11-07 16:42:56.547937 IP 172.65.251.78.443 > 10.32.43.124.58932: Flags [.], ack 550, win 9, options [nop,nop,TS val 4236801644 ecr 950037546], length 0`
	wantedResult := normalizedLog{
		timestamp:        "2024-11-07 16:42:56.547937",
		src_ip:           "172.65.251.78",
		dst_ip:           "10.32.43.124",
		src_port:         "443",
		dst_port:         "58932",
		protocol:         "IP",
		sourceType:       "",
		sourceFile:       "",
		sourceLineNumber: 0,
	}

	results := parseTcpDumpLine(line)

	result := results[0]

	compareResult, mismatch := compareNormalizedLogs(wantedResult, result)

	if !compareResult {
		t.Fatalf(mismatch)
	}
}

// compares if all fields in two normalized logs are equal
func compareNormalizedLogs(log1, log2 normalizedLog) (bool, string) {

	formatString := ", not matching, expected %s, got %s"

	if log1.timestamp != log2.timestamp {
		return false, fmt.Sprintf("timestamp"+formatString, log1.timestamp, log2.timestamp)
	}
	if log1.src_ip != log2.src_ip {
		return false, fmt.Sprintf("src_ip"+formatString, log1.src_ip, log2.src_ip)
	}
	if log1.dst_ip != log2.dst_ip {
		return false, fmt.Sprintf("dst_ip"+formatString, log1.dst_ip, log2.dst_ip)
	}
	if log1.src_port != log2.src_port {
		return false, fmt.Sprintf("src_port"+formatString, log1.src_port, log2.src_port)
	}
	if log1.dst_port != log2.dst_port {
		return false, fmt.Sprintf("dst_port"+formatString, log1.dst_port, log2.dst_port)
	}
	if log1.protocol != log2.protocol {
		return false, fmt.Sprintf("protocol"+formatString, log1.protocol, log2.protocol)
	}
	if log1.sourceType != log2.sourceType {
		return false, fmt.Sprintf("sourceType"+formatString, log1.sourceType, log2.sourceType)
	}
	if log1.sourceFile != log2.sourceFile {
		return false, fmt.Sprintf("sourceFile"+formatString, log1.sourceFile, log2.sourceFile)
	}
	if log1.sourceLineNumber != log2.sourceLineNumber {
		return false, fmt.Sprintf("sourceLineNumber"+formatString, log1.sourceLineNumber, log2.sourceLineNumber)
	}

	return true, ""
}
