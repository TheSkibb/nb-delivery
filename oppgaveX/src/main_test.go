package main

import (
	"testing"
)

// normal package list where everything is as it should
func TestGetPackageListNormal(t *testing.T) {
	result, err := getPackageList("./Packages_short")

	//this file should not error
	if err != nil {
		t.Fatal("getting packages for ./Packages_short failed with error" + err.Error())
	}

	//the file contains 960 packages
	if len(result) != 960 {
		t.Fatalf("Packages_short should contain 960 packages, not %d", len(result))
	}
}

// if a package is missing the version, the getPackageList should fail
func TestGetPackageInfoFailsForMissingVersion(t *testing.T) {

	result, err := getPackageList("./Packages_missing_version")

	// function should have returned error
	if err == nil || len(result) != 0 {
		t.Fatal("getPackageList with Packages_missing_version should return an error and empty list")
	}
}

// if a package is missing the name, the getPackageList function should fail
func TestGetPackageListFailsForMissingPackageName(t *testing.T) {
	result, err := getPackageList("./Packages_missing_name")

	// function should have returned error
	if err == nil || len(result) != 0 {
		t.Fatal("getPackageList with Packages_missing_name should return with error and empty list")
	}
}
