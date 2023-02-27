cmake_minimum_required(VERSION 3.5)
set(CMAKE_DEPENDS_USE_COMPILER FALSE)
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wno-unused-command-line-argument")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wno-unused-command-line-argument -DEOSIO_NO_RICARDIAN")

project(eosio.token)

find_package(blanc)
include(EosioWasmToolchain)

add_contract(eosio.token eosio.token
   ${CMAKE_CURRENT_SOURCE_DIR}/atom/src/eosio.token.cpp
)

target_include_directories(eosio.token
   PUBLIC
   ${CMAKE_CURRENT_SOURCE_DIR}/atom/include
)