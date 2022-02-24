<template>
  <div :class="$style.categoryPage">
    <portal to="header">
      <HeaderContent step="Метод поиска заказа"/>
    </portal>
    <div :class="$style.categories">
      <button
        :class="$style.button"
        @click="$emit('changePage', require('@/components/pages/ScanBarcodePage'))"
      >
        Сканировать шрихкод
      </button>
      <button
        :class="$style.button"
        @click="$emit('changePage', require('@/components/pages/InputPage'))"
      >
        Ввести номер
      </button>
    </div>
    <portal to="footer">
      <MainFooter>
        <BaseButton
          @click="$emit('changePage', require('@/components/pages/IdlePage'))"
          main
        >
          Выйти
        </BaseButton>
      </MainFooter>
    </portal>
  </div>
</template>

<script>
  import HeaderContent from "@/components/pages/HeaderContent";
  import MainFooter from "@/components/service/MainFooter";
  import BaseButton from "@/components/base/BaseButton";
  
  export default {
    name: "SelectCategoryPage",
    components: { HeaderContent, MainFooter, BaseButton },
  }

</script>

<style lang="scss" module>
  .categoryPage {
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .categories {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 70vw;
      
      .button {
        width: 30vw;
        height: 25vh;
        background-color: $ecMainLight;
        box-shadow: $ecCardShadow;
        border-radius: 30px;
        font-size: 2rem;
        font-weight: bold;
        padding: 2.5rem;
        
        &:active {
          box-shadow: none;
        }
      }
    }
  }
</style>