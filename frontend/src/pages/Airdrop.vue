<template>
  <div>
    <Hero/>
    <FeatureList/>
    <MoreInformation/>
    <DownloadWallet/>
  </div>
</template>

<script>
import MoreInformation from '@/components/moreInformation'
import Hero from '@/components/Hero'
import FeatureList from '@/components/featureList'
import DownloadWallet from '@/components/downloadWallet'

export default {
  name: 'Airdrop',

  components: {
    MoreInformation,
    Hero,
    FeatureList,
    DownloadWallet
  }
}
</script>

<style>

</style>
