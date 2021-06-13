module.exports = {
  apps : [
    {
      name: 'loan-airdrop-csv',
      script: 'dist/index.js',
      node_args : '-r dotenv/config',
      watch: false,
      env: {
        'OUTPUTS_LOOP_TIMER': 15 * 60 * 1000,
        'CREATE_AIRDROP_OUTPUTS': true,
        'CREATE_OUTPUTS_LOAN': true
      },
      // node_args: '--max_old_space_size=4096'
    }
  ]
};