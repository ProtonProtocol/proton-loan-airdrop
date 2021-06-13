<template>
  <div class="bg-gradient-to-b from-white to-gray-50">
    <div class="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-3xl font-extrabold text-gray-900">{{ features.length }} ways to earn LOAN Airdrop</h2>
        <p class="mt-4 text-lg text-gray-500">There are many ways to get the airdrop, find the best one for you.</p>
      </div>

      <dl class="mt-12 space-y-10 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-8">
        <div class="flex space-x-3" v-for="feature of features" :key="feature.title">
          <svg class="flex-shrink-0 h-6 w-6 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>

          <div class="space-y-2">
            <dt class="text-lg leading-6 font-medium text-gray-900">{{ feature.title }}</dt>
            <dd class="flex space-x-3 lg:py-0 lg:pb-4">
              <span class="text-base text-gray-500">{{ feature.description }}</span>
            </dd>
          </div>
        </div>
      </dl>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FeatureList',

  data () {
    return {
      features: [
        {
          title: 'XMT (MTL)',
          description: 'Receive 333 LOAN for every 1 XMT held on Proton Chain.'
        },
        {
          title: 'Unstaked XPR',
          description: 'Receive 1 LOAN for every 1 XPR held unstaked'
        },
        {
          title: 'Short Staked XPR',
          description: 'Receive 2 LOAN for every 1 XPR held staked'
        },
        {
          title: 'XPR-USDC Liquidity',
          description: 'Receive 2 LOAN for every 1 XPR held in the XPR-USDC ProtonSwap liquidity pool'
        },
        {
          title: 'XMT-USDC Liquidity',
          description: 'Receive 666 LOAN for every 1 XMT held in the XMT-USDC ProtonSwap liquidity pool'
        },
        {
          title: '90 Day Long stake',
          description: 'Receive 10 LOAN for every 1 XPR long staked for 90 days'
        },
        {
          title: '365 Day Long stake',
          description: 'Receive 30 LOAN for every 1 XPR long staked for 365 days'
        },
        {
          title: 'Using Proton Lend (Future)',
          description: 'Borrowers and lenders on the platform will earn LOAN'
        }
      ]
    }
  }
}
</script>

<style>

</style>
