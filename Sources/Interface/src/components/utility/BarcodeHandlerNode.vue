<script>
  import { WsScanner } from "@/services/api/WsScanner";
  import { log } from "@/helpers/log";
  
  export default {
    name: "BarcodeHandlerNode",
    methods: {
      update(val) {
        log.step(`Получили данные со сканера: ${val}`)
        this.$emit('message', val)
      }
    },
    mounted() {
      WsScanner.onmessage = val => this.update(val.data)
    },
    beforeDestroy() {
      WsScanner.disable()
      log.step('Закрываем соединение со сканером')
    },
    render: h => h()
  }
</script>
