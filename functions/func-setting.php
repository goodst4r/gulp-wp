<?php

//WPのバージョン情報非表示
remove_action( 'wp_head', 'wp_generator');

// アイキャッチ画像
add_theme_support('post-thumbnails');

// Classic editorに変更
add_filter('use_block_editor_for_post', '__return_false');

// ContactForm7で自動挿入されるPタグ、brタグを削除
add_filter('wpcf7_autop_or_not', 'wpcf7_autop_return_false');
function wpcf7_autop_return_false() {
  return false;
}

// 絵文字関連
remove_action('wp_head', 'print_emoji_detection_script', 7);
remove_action( 'admin_print_scripts', 'print_emoji_detection_script');
remove_action( 'wp_print_styles',     'print_emoji_styles');
remove_action( 'admin_print_styles',  'print_emoji_styles');
remove_action('wp_head', 'wp_shortlink_wp_head');
remove_action('wp_head', 'rsd_link');
remove_action('wp_head', 'wlwmanifest_link');
add_filter( 'emoji_svg_url', '__return_false' );

// Embed系削除
remove_action('wp_head','rest_output_link_wp_head');
remove_action('wp_head','wp_oembed_add_discovery_links');
remove_action('wp_head','wp_oembed_add_host_js');

//　jsとcssにパラメータ付与
function change_version_to_date($src) {
  if (strpos($src, 'ver=')) {
    $url_parts = parse_url($src);
    if (!isset($url_parts['query'])) {
      return $src;
    }

    parse_str($url_parts['query'], $queries);
    if (!isset($queries['ver'])) {
      return $src;
    }

    $current_date = date('Ymd');
    $src = remove_query_arg('ver', $src);
    $src = add_query_arg('ver', $current_date, $src);
  }
  return $src;
}
add_filter('style_loader_src', 'change_version_to_date', 9999);
add_filter('script_loader_src', 'change_version_to_date', 9999);