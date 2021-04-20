#! /bin/bash
###########################################################################################
###########################################################################################
##
##  rewards
##  2020 by CryptoLions [ https://CryptoLions.io ]
##
##  Demo:
##  Jungle Testnet: 
##  EOS Mainnet: 
##
##  Sources:
##  
##  
##
###########################################################################################
###########################################################################################

rm -r ./build/

printf "\t=========== Building Contract [CryptoLions.io] ===========\n\n"

RED='\033[0;31m'
NC='\033[0m'

CORES=`getconf _NPROCESSORS_ONLN`

mkdir -p build

pushd build &> /dev/null
cmake ../
make -j${CORES}
popd &> /dev/null
