<?php
function add_scripts() {
  wp_enqueue_script( 'main-script', get_template_directory_uri() . '/assets/js/script.js', array('jquery'), false, true );
}
add_action( 'wp_enqueue_scripts', 'add_scripts' );