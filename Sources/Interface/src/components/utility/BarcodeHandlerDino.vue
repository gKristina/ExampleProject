<script>
  import { dino } from "@/helpers/emitters/dino";

  export default {
    name: "BarcodeHandlerDino",
    methods: {
      update(val) {
        this.$emit('update', val);
      }
    },
    created() {
      dino.on('barcode', this.update);
    },
    beforeDestroy() {
      dino.off('barcode', this.update);
    },
    render: h => h(),
  }
</script>
