<template>
  <div>
    <Hero/>
    <FeatureList/>
    <MoreInformation/>
  </div>
</template>

<script>
import MoreInformation from '@/components/moreInformation'
import Hero from '@/components/Hero'
import FeatureList from '@/components/featureList'

export default {
  name: 'Airdrop',

  components: {
    MoreInformation,
    Hero,
    FeatureList
  }
}
</script>

<style>

</style>
