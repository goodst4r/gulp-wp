<?php
function add_styles() {

  wp_enqueue_style( 'slick-css', 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.css' );
  wp_enqueue_style( 'slick-theme-css', 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick-theme.min.css' );

  wp_enqueue_style( 'main-style', get_stylesheet_directory_uri() . '/assets/css/style.min.css' );
}

add_action( 'wp_enqueue_scripts', 'add_styles' );
