<template>
  <div class="relative bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex justify-between items-center border-b border-gray-200 py-6 md:justify-start md:space-x-4">
        <div class="flex justify-start">
          <router-link to="/">
            <span class="sr-only">Proton</span>
            <img class="w-auto h-12" src="@/assets/loan.tokenLOAN2.png" alt="">
          </router-link>
        </div>

        <div class="flex space-x-4 justify-center">
          <router-link to="/" class="text-base font-medium text-gray-500 hover:text-purple-900">
            LOAN Airdrop
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import Avatar from '@/components/avatar'

export default {
  name: 'AppHeader',

  components: {
    // Avatar
  }
}
</script>

<style>

</style>
