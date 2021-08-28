cmake_minimum_required( VERSION 3.5 )

project(proton)

set(EOSIO_WASM_OLD_BEHAVIOR "Off")
find_package(eosio.cdt)

add_contract(eosio.token eosio.token
   ${CMAKE_CURRENT_SOURCE_DIR}/src/eosio.token.cpp
)

target_include_directories(eosio.token
   PUBLIC
   ${CMAKE_CURRENT_SOURCE_DIR}/include
)

target_compile_definitions(eosio.token PRIVATE -D_LIBCPP_STRSTREAM -DBOOST_EXCEPTION_DISABLE=1 -D_GLIBCXX_SSTREAM=1 -D_LIBCPP_SSTREAM -DBOOST_NO_IOSTREAM -DBOOST_NO_STRINGSTREAM )

set_target_properties(eosio.token
   PROPERTIES
   RUNTIME_OUTPUT_DIRECTORY "${CMAKE_CURRENT_BINARY_DIR}"
)

target_compile_options( eosio.token PUBLIC -R${CMAKE_CURRENT_SOURCE_DIR}/ricardian -R${CMAKE_CURRENT_BINARY_DIR}/ricardian)