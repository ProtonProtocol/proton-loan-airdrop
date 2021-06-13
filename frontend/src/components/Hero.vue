<template>
  <div class="relative bg-gray-800 overflow-hidden">
    <div class="hidden sm:block sm:absolute sm:inset-0" aria-hidden="true">
      <svg class="absolute bottom-0 right-0 transform translate-x-1/2 mb-48 text-gray-700 lg:top-0 lg:mt-28 lg:mb-0 xl:transform-none xl:translate-x-0" width="364" height="384" viewBox="0 0 364 384" fill="none">
        <defs>
          <pattern id="eab71dd9-9d7a-47bd-8044-256344ee00d0" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="4" height="4" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="364" height="384" fill="url(#eab71dd9-9d7a-47bd-8044-256344ee00d0)" />
      </svg>
    </div>
    <div class="relative pt-6 pb-16 sm:pb-24">
      <main class="mt-16 sm:mt-24">
        <div class="mx-auto max-w-7xl">
          <div class="lg:grid lg:grid-cols-12 lg:gap-8">
            <div class="px-4 sm:px-6 sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
              <div>
                <a href="https://jobs.lever.co/metalpay" target="_blank" class="inline-flex items-center text-white bg-gray-900 rounded-full p-1 pr-2 sm:text-base lg:text-sm xl:text-base hover:text-gray-200">
                  <span class="px-3 py-0.5 text-white text-xs font-semibold leading-5 uppercase tracking-wide bg-purple-500 rounded-full">We're hiring</span>
                  <span class="ml-4 mr-3 text-sm">Visit our careers page</span>
                </a>
                <h1 class="mt-4 text-4xl tracking-tight font-extrabold text-white sm:mt-5 sm:leading-none lg:mt-6 lg:text-5xl xl:text-6xl">
                  <span class="md:block">Get ready for your</span>
                  {{ ' ' }}
                  <span class="text-purple-400 md:block">LOAN Airdrop</span>
                </h1>
                <p class="mt-3 text-base text-gray-300 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                  Proton Lend opens up a new possibility for borrowing and lending against multiple blockchains that were not accessible on Ethereum or other protocols previously.
                </p>
              </div>
            </div>
            <div class="mt-16 sm:mt-24 lg:mt-0 lg:col-span-6">
              <div class="bg-white sm:max-w-md sm:w-full sm:mx-auto sm:rounded-lg sm:overflow-hidden">
                <div class="px-4 py-8 sm:px-10">
                  <div>
                    <p class="text-sm font-medium text-gray-700">
                      LOAN Snapshot in:
                    </p>

                    <div class="mt-1 grid grid-cols-3 gap-3">
                      <div class="text-3xl text-purple-500">
                        {{ timeToAirdrop.values.hours }} hrs
                      </div>

                      <div class="text-3xl text-purple-500">
                        {{ timeToAirdrop.values.minutes }} mins
                      </div>

                      <div class="text-3xl text-purple-500">
                        {{ timeToAirdrop.values.seconds.toFixed(0) }} secs
                      </div>
                    </div>
                  </div>

                  <div class="mt-6 relative">
                    <div class="absolute inset-0 flex items-center" aria-hidden="true">
                      <div class="w-full border-t border-gray-300" />
                    </div>
                    <div class="relative flex justify-center text-sm">
                      <span class="px-2 bg-white text-gray-500">
                        Or
                      </span>
                    </div>
                  </div>

                  <div class="mt-6 space-y-6">
                    <div>
                      <label for="name" class="sr-only">Proton Account</label>
                      <input
                        v-model="protonAccount"
                        class="py-4 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm border-gray-300 rounded-md"
                        type="text" name="name" id="name" autocomplete="name" placeholder="Proton Account" required="" />
                    </div>

                    <div>
                      <button @click="checkAllocation" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                        Check Allocation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <AirdropModal
      v-if="allocation"
      @modal-close="allocation = undefined"
      :allocation="allocation"
    />
  </div>
</template>

<script>
import { DateTime } from 'luxon'
import AirdropModal from './airdropModal.vue'
export default {
  components: {
    AirdropModal
  },

  data () {
    return {
      airdropTime: DateTime.utc(2021, 6, 15, 7),
      now: DateTime.utc(),
      allocation: undefined,
      protonAccount: undefined
    }
  },

  watch: {
    protonAccount () {
      this.allocation = undefined
    }
  },

  computed: {
    timeToAirdrop () {
      const time = this.airdropTime.diff(this.now, ['hours', 'minutes', 'seconds'])
      return time
    }
  },

  methods: {
    async checkAllocation () {
      if (!this.protonAccount) {
        return
      }

      const account = this.protonAccount.trim().toLowerCase()

      const res = await fetch(`https://www.api.bloks.io/proton/airdrop/${account}`)

      try {
        this.allocation = await res.json()
      } catch (e) {
        this.allocation = undefined
      }
    }
  },

  created () {
    setInterval(() => {
      this.now = DateTime.utc()
    }, 1000)
  }
}
</script>
