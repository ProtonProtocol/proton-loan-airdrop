# Proton LP rewards

#### Structure

- [The rewards contract](./lending)
- [The standard eosio.token contract](./eosio.token). Used for share symbols (LP tokens / interest-bearing tokens) of the markets.
- [The Hydra tests](./js_test)

## Development

#### Build

```bash
# compile smart contracts
./build.sh
```

#### Tests

```bash
# install hydra and login, adjust hydra.yml options
npm i -g @klevoya/hydra
# run tests
cd js_tests
# run tests
npm test -- rewards
```

# Documentation

> 🚧 TODO