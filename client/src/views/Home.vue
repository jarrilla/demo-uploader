<template>
  <quote-form />
</template>

<script>
  import QuoteForm from '../components/request/QuoteForm.vue'

  export default {
    name: 'Home',

    components: {
      QuoteForm,
    },
    mounted(){
      document.title = "RFQ Module"
    }
  }
</script>
