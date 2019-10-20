# Whiteflag WHL Utility

## Introduction

This Whiteflag utility is a [Node.js](https://nodejs.org/en/about/) command
line interface (CLI) that creates and sends Whiteflag messages for specified
cultural heritage sites listed on the UNESCO World Heritage List.

This utility is for technology development, test and evaluation purposes only.
This means that it is a tool in support of testing the Whiteflag protocol, but
it is not designed and tested for secure usage and performance in a production
environment.

## License

The Whiteflag WHL utility is dedicated to the public domain under the
[Creative Commons CC0-1.0 Universal Public Domain Dedication](http://creativecommons.org/publicdomain/zero/1.0/).
statement. Note that this only applies to this software, and that this
explicitly DOES NOT imply endorsement or permission by UNESCO to use
WHL information, which is subject to the [terms and policies of the UNESCO World Heritage Centre](https://whc.unesco.org/en/disclaimer/).
Please see `LICENSE.md` for details.

The Whiteflag WHL utility requires third party software packages, which are
not part of this distribution and may be licenced differently.

## Installation

### Prerequisites

To deploy the Whiteflag WHL utility, make sure the following prerequisite
software is installed:

* Node.js

### Deployment

First, copy the repository to the deployment directory, such as
`/opt/whiteflag-whl`. Please use a version tagged commit for a stable version.

After copying the repository, install the required Node.js modules of external
software libraries and then create a global link to the package by running the
following commands in the deployment directory:

```shell
npm install
npm link
```

## Running

To invoke the Whitefag WHL utility from the command line, use the `wfwhl`
command from any directory:

```shell
wfwhl [options]
```
