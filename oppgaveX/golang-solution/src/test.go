				//example of data that gives you a vulnerability result
				example := packageAndVersion{
					PackageNameAndEnv: PackageFormat{
						PackageName: "389-ds-base",
						Ecosystem:   "Debian:12",
					},
					Version: "2.3.1+dfsg1-1",
				}

				queryData, err := json.Marshal(example)
