# Whiteflag WHL Utility

## Introduction

This Whiteflag utility is a [Node.js](https://nodejs.org/en/about/) command
line interface (CLI) that creates and sends Whiteflag messages for specified
cultural heritage sites listed on the UNESCO World Heritage List.

Sending a Whiteflag message is the digital equivalent of placing a physical
protective sign. Whiteflag is a fully neutral and secure communciations means
that allows near real-time communication in conflicts to exchange early
warning and status information to create shared situational awareness.

Note that this utility only processes *cultural* heritage sites, because
Whiteflag (currently) only defines a message (`P52`) that corresponds with the
protective sign for cultural property i.a.w. [the 1954 Hague Convention](http://www.unesco.org/new/en/culture/themes/armed-conflict-and-heritage/convention-and-protocols/1954-hague-convention/).

This utility is for technology development, test and evaluation purposes only.
This means that it is a tool in support of testing the Whiteflag protocol, but
it is not designed and tested for secure usage and performance in a production
environment.

## Installation

### Prerequisites

To deploy the Whiteflag WHL utility, make sure the following prerequisite
software is installed:

* [Node.js](https://nodejs.org/en/about/) including [NPM](https://www.npmjs.com/get-npm)

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

## Usage

To invoke the Whitefag WHL utility from the command line, use the `wfwhl`
command with the following arguments from any directory:

```
wfwhl [-s <id> ...] [-w <url>|-f <file>]
      [-t -i <url> -b <blockchain> -a <address>] [-ov]
```

### Options

The main options are the following:

* `-s`, `--sites`        : Specify the world heritage site(s) to be processed by \<id\> number; multiple sites may be specified. If no sites are specified, all sites are processed.
* `-w`, `--web`          : The source \<url\> of the WHL in XML on the web. If not specified the default is `https://whc.unesco.org/en/list/xml/`. Cannot be used with `-f`.
* `-f`, `--file`         : The source \<file\> containing the WHL in XML. Cannot be used with `-w`.
* `-t`, `--transmit`**   : Transmit the Whiteflag message(s) on the blockchain. Requires `-i`, `-b` and `-a` to be specified.
* `-i`, `--interface`**  : The Whiteflag API REST interface \<url\> to post the message(s) to be sent.
* `-b`, `--blockchain`** : The \<blockchain\> to be used for sending the message(s).
* `-a`, `--address`**    : The blockchain \<address\> to be used for sending the message(s).
* `-o`, `--stdout`       : Send the Whiteflag message(s) to stdout. This allows the data to be piped to other processes.
* `-v`, `--verbose`      : Provide detailed processing output.

**: _in development_

Other supporting options are:

* `--help`       : Show help message.
* `--version`    : Show version number.
* `--config`     : Path to a JSON config file with preconfigured arguments; especially useful to specify Whiteflag API URL, blockchain and address.

### Examples

To use the default WHL website as the source to create Whiteflag messages for
world heritage site 23 and output them on standard output:

```shell
wfwhl -s 23 -o
```

To use a file with the WHL XML data as the source to create Whiteflag messages
for 3 world heritage sites, with detailed processing information and the
Whiteflag messages on standard output:

```shell
wfwhl -s 23 25 32 -f /data/whl.xml -vo
```

To send Whiteflag messages for all cultural heritage sites from the WHL XML
list contained in a file to standard output:

```shell
wfwhl -f /data/whl.xml -o
```

## License

The Whiteflag WHL utility is dedicated to the public domain under the
[Creative Commons CC0-1.0 Universal Public Domain Dedication](http://creativecommons.org/publicdomain/zero/1.0/).
statement. Note that this only applies to this software, and that this
explicitly DOES NOT imply endorsement or permission by UNESCO to use
WHL information, which is subject to the [terms and policies of the UNESCO World Heritage Centre](https://whc.unesco.org/en/disclaimer/).
Please see `LICENSE.md` for details.

The Whiteflag WHL utility requires third party software packages, which are
not part of this distribution and may be licenced differently.
