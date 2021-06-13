<template>
  <div class="fixed z-10 inset-0 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <transition
        enter-active-class="ease-out duration-300"
        enter-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="ease-in duration-200"
        leave-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="close">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
      </transition>

      <!-- This element is to trick the browser into centering the modal contents. -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <transition
        enter-active-class="ease-out duration-300"
        enter-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        enter-to-class="opacity-100 translate-y-0 sm:scale-100"
        leave-active-class="ease-in duration-200"
        leave-class="opacity-100 translate-y-0 sm:scale-100"
        leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      >
        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
          <div>
            <div class="mx-auto flex items-center justify-center h-12 w-14 rounded-full bg-purple-100">
              <!-- Heroicon name: check -->
              <svg class="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-5">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                Total: {{ allocation.totalLoan | formatNumber(4)  }} LOAN
              </h3>
              <div class="mt-6">
                <p class="text-sm text-gray-500 text-left">
                  <b>XMT Balance:</b> {{ allocation.xmtBalance | formatNumber(8) }} XMT = {{ allocation.xmtLoan | formatNumber(4) }} LOAN <br/>
                  <b>XPR Balance:</b> {{ allocation.xprBalance | formatNumber(4) }} XPR = {{ allocation.xprLoan | formatNumber(4) }} LOAN<br/>
                  <b>XPR Refunding:</b> {{ allocation.refundingXpr | formatNumber(4) }} XPR = {{ allocation.refundingXprLoan | formatNumber(4) }} LOAN<br/>
                  <b>XPR Short Staking:</b> {{ allocation.shortStake | formatNumber(4) }} XPR = {{ allocation.shortStakeLoan | formatNumber(4) }} LOAN<br/>
                  <b>XMT-USDC LP:</b> {{ allocation.xmtLp | formatNumber(4) }} XMT = {{ allocation.xmtLpLoan | formatNumber(4) }} LOAN<br/>
                  <b>XPR-USDC LP:</b> {{ allocation.xprLp | formatNumber(4) }} XPR = {{ allocation.xprLpLoan | formatNumber(4) }} LOAN<br/>
                  <b>XPR-USDC Farming:</b> {{ allocation.farmerLp | formatNumber(4) }} XPR = {{ allocation.farmerLpLoan | formatNumber(4) }} LOAN<br/>
                  <b>Longstake 90 Days:</b> {{ allocation.longStake90Days | formatNumber(4) }} XPR = {{ allocation.longStake90DaysLoan | formatNumber(4) }} LOAN<br/>
                  <b>Longstake 365 Days:</b> {{ allocation.longStake365Days | formatNumber(4) }} XPR = {{ allocation.longStake365DaysLoan | formatNumber(4) }} LOAN<br/>
                </p>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  props: ['allocation'],
  data () {
    return {
    }
  },

  computed: {

  },

  methods: {
    close () {
      this.$emit('modal-close')
    }
  }
}
</script>

<style>
.days-input {
  width: 33px;
  padding: 10px;
  margin: 0px 10px 10px 10px;
}
</style>
