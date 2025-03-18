<?php
function add_scripts() {

  wp_deregister_script('jquery');
  wp_enqueue_script('jquery', '//ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js' );

  wp_enqueue_script( 'slick-js', 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.js', array('jquery'), false, true );

  wp_enqueue_script( 'main-script', get_template_directory_uri() . '/assets/js/script.min.js', array('jquery', 'slick-js'), false, true );
}
add_action( 'wp_enqueue_scripts', 'add_scripts' );
