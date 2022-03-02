<template>
  <div :class="$style.header">
    <div :class="$style.headerTop">
      <slot name="leftPart">
        <div :class="$style.date">{{date}}</div>
      </slot>
      <slot name="middlePart">
        <h1 :class="$style.title">Терминал оплаты</h1>
      </slot>
      <slot name="rightPart">
        <div :class="$style.phone">
          <PhoneIcon :iconColor="iconColor"/>
          <p>{{ supportPhone }}</p>
        </div>
      </slot>
    </div>
    <h2
      v-if="step"
      :class="$style.step"
    >{{step}}</h2>
  </div>
</template>

<script>
  import moment from "moment";
  import {getSupportPhone} from "@/helpers/externals";
  import PhoneIcon from "@/components/svg/PhoneIcon";
  
  export default {
    name: "HeaderContent",
    components: {PhoneIcon},
    props: {
      step: {
        type: String,
        required: false,
        default: ''
      },
      iconColor: {
        type: String,
        required: false,
        default: 'dark'
      }
    },
    data() {
      return {
        supportPhone: getSupportPhone(),
        dateInterval: '',
        date: this.formDate()
      }
    },
    methods: {
      formDate() {
        return moment().format('H:mm / DD.MM.YY')
      }
    },
    beforeMount() {
      this.dateInterval = setInterval(() => {
        this.date = this.formDate()
      }, 1000)
    },
    beforeDestroy() {
      clearInterval(this.dateInterval)
    }
  }
</script>

<style lang="scss" module>
  .header {
    width: 100vw;
    height: 100%;
    background-color: $ecMainLight;
    
    padding: 20px 60px;
  
    .step {
      display: flex;
      align-items: center;
      font-weight: 800;
      font-size: 48px;
      line-height: 58px;
      
      &:after {
        content: '';
        display: block;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        margin: 10px 0 0 15px;
        background-color: $ecAccentLight;
      }
    }
  }
  
  .headerTop {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    
    .title {
      font-size: 3rem;
      font-weight: 800;
      margin: 0;
    }
    
    .date {
      color: $ecFontSecondary;
      width: 170px;
    }
    
    .phone {
      display: flex;
      align-items: center;
      
      p {
        margin-left: 10px;
      }
    }
  }
</style>