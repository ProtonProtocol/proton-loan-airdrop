module.exports = {
  apps : [
    {
      name: 'loan-airdrop-csv',
      script: 'dist/index.js',
      node_args : '-r dotenv/config',
      watch: false,
      env: {
        'CREATE_OUTPUTS': true,
        'CREATE_OUTPUTS_LOAN': true,
        'CREATE_OUTPUTS_LOOP_TIMER': 5 * 60 * 1000,
      },
      // node_args: '--max_old_space_size=4096'
    }
  ]
};