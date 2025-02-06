<?php
function add_styles() {
  wp_enqueue_style( 'main-style', get_stylesheet_directory_uri() . '/assets/css/style.css' );
}
add_action( 'wp_enqueue_scripts', 'add_styles' );