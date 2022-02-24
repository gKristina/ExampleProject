<template>
  <div :class="$style.example">
    <portal to="header">
      <HeaderContent step="Тестовая страница"/>
    </portal>
    <p :class="$style.text">Usus est optĭmus magister</p>
    <p :class="$style.text"><i>Опыт — лучший учитель</i></p>
    <portal to="footer">
      <MainFooter>
        <BaseButton
          back
          @click="$emit('changePage', require('@/components/pages/IdlePage'))"
        >Назад
        </BaseButton>
        <BaseButton
          main
          @click="$emit('changePage', require('@/components/pages/IdlePage'))"
        >На главную
        </BaseButton>
        <BaseButton
          :active="true"
          next
          @click="$emit('changePage', require('@/components/pages/PaymentPickPage'))"
        >Вперед
        </BaseButton>
      </MainFooter>
    </portal>
  </div>
</template>

<script>
  import BaseButton from "@/components/base/BaseButton";
  import MainFooter from "@/components/service/MainFooter";
  import HeaderContent from "@/components/pages/HeaderContent";

  export default {
    name: "ExamplePage",
    components: {HeaderContent, MainFooter, BaseButton },
  }
</script>

<style lang="scss" module>
  .example {
    width: 100vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .text {
      font-size: 42px;
    }
  }
</style>
