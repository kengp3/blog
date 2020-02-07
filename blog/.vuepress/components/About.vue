<template>
  <div class="about-me">
    <div class="photo-section">
      <div class="photo" />
    </div>
    <Content />
  </div>
</template>

<style lang="stylus">
.about-me
  text-align center

.photo-section
  text-align center
  margin-bottom 10px
  .photo
    display inline-block
    width: 230px
    height 230px
    border-radius 50%
    background-image: url('https://avatars2.githubusercontent.com/u/2957288?s=230&v=4');
</style>
