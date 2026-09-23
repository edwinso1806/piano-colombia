--
-- PostgreSQL database dump
--

-- Dumped from database version 13.2
-- Dumped by pg_dump version 13.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.store_locale DROP CONSTRAINT IF EXISTS store_locale_store_id_foreign;
ALTER TABLE IF EXISTS ONLY public.store_currency DROP CONSTRAINT IF EXISTS store_currency_store_id_foreign;
ALTER TABLE IF EXISTS ONLY public.stock_location DROP CONSTRAINT IF EXISTS stock_location_address_id_foreign;
ALTER TABLE IF EXISTS ONLY public.shipping_option DROP CONSTRAINT IF EXISTS shipping_option_shipping_profile_id_foreign;
ALTER TABLE IF EXISTS ONLY public.shipping_option DROP CONSTRAINT IF EXISTS shipping_option_shipping_option_type_id_foreign;
ALTER TABLE IF EXISTS ONLY public.shipping_option DROP CONSTRAINT IF EXISTS shipping_option_service_zone_id_foreign;
ALTER TABLE IF EXISTS ONLY public.shipping_option_rule DROP CONSTRAINT IF EXISTS shipping_option_rule_shipping_option_id_foreign;
ALTER TABLE IF EXISTS ONLY public.shipping_option DROP CONSTRAINT IF EXISTS shipping_option_provider_id_foreign;
ALTER TABLE IF EXISTS ONLY public.service_zone DROP CONSTRAINT IF EXISTS service_zone_fulfillment_set_id_foreign;
ALTER TABLE IF EXISTS ONLY public.return_reason DROP CONSTRAINT IF EXISTS return_reason_parent_return_reason_id_foreign;
ALTER TABLE IF EXISTS ONLY public.reservation_item DROP CONSTRAINT IF EXISTS reservation_item_inventory_item_id_foreign;
ALTER TABLE IF EXISTS ONLY public.region_country DROP CONSTRAINT IF EXISTS region_country_region_id_foreign;
ALTER TABLE IF EXISTS ONLY public.refund DROP CONSTRAINT IF EXISTS refund_payment_id_foreign;
ALTER TABLE IF EXISTS ONLY public.provider_identity DROP CONSTRAINT IF EXISTS provider_identity_auth_identity_id_foreign;
ALTER TABLE IF EXISTS ONLY public.promotion_rule_value DROP CONSTRAINT IF EXISTS promotion_rule_value_promotion_rule_id_foreign;
ALTER TABLE IF EXISTS ONLY public.promotion_promotion_rule DROP CONSTRAINT IF EXISTS promotion_promotion_rule_promotion_rule_id_foreign;
ALTER TABLE IF EXISTS ONLY public.promotion_promotion_rule DROP CONSTRAINT IF EXISTS promotion_promotion_rule_promotion_id_foreign;
ALTER TABLE IF EXISTS ONLY public.promotion DROP CONSTRAINT IF EXISTS promotion_campaign_id_foreign;
ALTER TABLE IF EXISTS ONLY public.promotion_campaign_budget_usage DROP CONSTRAINT IF EXISTS promotion_campaign_budget_usage_budget_id_foreign;
ALTER TABLE IF EXISTS ONLY public.promotion_campaign_budget DROP CONSTRAINT IF EXISTS promotion_campaign_budget_campaign_id_foreign;
ALTER TABLE IF EXISTS ONLY public.promotion_application_method DROP CONSTRAINT IF EXISTS promotion_application_method_promotion_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_variant_product_image DROP CONSTRAINT IF EXISTS product_variant_product_image_image_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_variant DROP CONSTRAINT IF EXISTS product_variant_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_variant_option DROP CONSTRAINT IF EXISTS product_variant_option_variant_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_variant_option DROP CONSTRAINT IF EXISTS product_variant_option_option_value_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product DROP CONSTRAINT IF EXISTS product_type_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_tags DROP CONSTRAINT IF EXISTS product_tags_product_tag_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_tags DROP CONSTRAINT IF EXISTS product_tags_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_product_option_value DROP CONSTRAINT IF EXISTS product_product_option_value_product_product_option_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_product_option_value DROP CONSTRAINT IF EXISTS product_product_option_value_product_option_value_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_product_option DROP CONSTRAINT IF EXISTS product_product_option_product_option_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_product_option DROP CONSTRAINT IF EXISTS product_product_option_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_option_value DROP CONSTRAINT IF EXISTS product_option_value_option_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product DROP CONSTRAINT IF EXISTS product_collection_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_category_product DROP CONSTRAINT IF EXISTS product_category_product_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_category_product DROP CONSTRAINT IF EXISTS product_category_product_product_category_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_category DROP CONSTRAINT IF EXISTS product_category_parent_category_id_foreign;
ALTER TABLE IF EXISTS ONLY public.price_rule DROP CONSTRAINT IF EXISTS price_rule_price_id_foreign;
ALTER TABLE IF EXISTS ONLY public.price DROP CONSTRAINT IF EXISTS price_price_set_id_foreign;
ALTER TABLE IF EXISTS ONLY public.price DROP CONSTRAINT IF EXISTS price_price_list_id_foreign;
ALTER TABLE IF EXISTS ONLY public.price_list_rule DROP CONSTRAINT IF EXISTS price_list_rule_price_list_id_foreign;
ALTER TABLE IF EXISTS ONLY public.payout_item DROP CONSTRAINT IF EXISTS payout_item_batch_id_foreign;
ALTER TABLE IF EXISTS ONLY public.payment_session DROP CONSTRAINT IF EXISTS payment_session_payment_collection_id_foreign;
ALTER TABLE IF EXISTS ONLY public.payment DROP CONSTRAINT IF EXISTS payment_payment_collection_id_foreign;
ALTER TABLE IF EXISTS ONLY public.payment_collection_payment_providers DROP CONSTRAINT IF EXISTS payment_collection_payment_providers_payment_pro_2d555_foreign;
ALTER TABLE IF EXISTS ONLY public.payment_collection_payment_providers DROP CONSTRAINT IF EXISTS payment_collection_payment_providers_payment_col_aa276_foreign;
ALTER TABLE IF EXISTS ONLY public.order_transaction DROP CONSTRAINT IF EXISTS order_transaction_order_id_foreign;
ALTER TABLE IF EXISTS ONLY public.order_summary DROP CONSTRAINT IF EXISTS order_summary_order_id_foreign;
ALTER TABLE IF EXISTS ONLY public.order_shipping DROP CONSTRAINT IF EXISTS order_shipping_order_id_foreign;
ALTER TABLE IF EXISTS ONLY public.order_shipping_method_tax_line DROP CONSTRAINT IF EXISTS order_shipping_method_tax_line_shipping_method_id_foreign;
ALTER TABLE IF EXISTS ONLY public.order_shipping_method_adjustment DROP CONSTRAINT IF EXISTS order_shipping_method_adjustment_shipping_method_id_foreign;
ALTER TABLE IF EXISTS ONLY public."order" DROP CONSTRAINT IF EXISTS order_shipping_address_id_foreign;
ALTER TABLE IF EXISTS ONLY public.order_line_item DROP CONSTRAINT IF EXISTS order_line_item_totals_id_foreign;
ALTER TABLE IF EXISTS ONLY public.order_line_item_tax_line DROP CONSTRAINT IF EXISTS order_line_item_tax_line_item_id_foreign;
ALTER TABLE IF EXISTS ONLY public.order_line_item_adjustment DROP CONSTRAINT IF EXISTS order_line_item_adjustment_item_id_foreign;
ALTER TABLE IF EXISTS ONLY public.order_item DROP CONSTRAINT IF EXISTS order_item_order_id_foreign;
ALTER TABLE IF EXISTS ONLY public.order_item DROP CONSTRAINT IF EXISTS order_item_item_id_foreign;
ALTER TABLE IF EXISTS ONLY public.order_credit_line DROP CONSTRAINT IF EXISTS order_credit_line_order_id_foreign;
ALTER TABLE IF EXISTS ONLY public.order_change DROP CONSTRAINT IF EXISTS order_change_order_id_foreign;
ALTER TABLE IF EXISTS ONLY public.order_change_action DROP CONSTRAINT IF EXISTS order_change_action_order_change_id_foreign;
ALTER TABLE IF EXISTS ONLY public."order" DROP CONSTRAINT IF EXISTS order_billing_address_id_foreign;
ALTER TABLE IF EXISTS ONLY public.notification DROP CONSTRAINT IF EXISTS notification_provider_id_foreign;
ALTER TABLE IF EXISTS ONLY public.inventory_level DROP CONSTRAINT IF EXISTS inventory_level_inventory_item_id_foreign;
ALTER TABLE IF EXISTS ONLY public.image DROP CONSTRAINT IF EXISTS image_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.geo_zone DROP CONSTRAINT IF EXISTS geo_zone_service_zone_id_foreign;
ALTER TABLE IF EXISTS ONLY public.fulfillment DROP CONSTRAINT IF EXISTS fulfillment_shipping_option_id_foreign;
ALTER TABLE IF EXISTS ONLY public.fulfillment DROP CONSTRAINT IF EXISTS fulfillment_provider_id_foreign;
ALTER TABLE IF EXISTS ONLY public.fulfillment_label DROP CONSTRAINT IF EXISTS fulfillment_label_fulfillment_id_foreign;
ALTER TABLE IF EXISTS ONLY public.fulfillment_item DROP CONSTRAINT IF EXISTS fulfillment_item_fulfillment_id_foreign;
ALTER TABLE IF EXISTS ONLY public.fulfillment DROP CONSTRAINT IF EXISTS fulfillment_delivery_address_id_foreign;
ALTER TABLE IF EXISTS ONLY public.customer_group_customer DROP CONSTRAINT IF EXISTS customer_group_customer_customer_id_foreign;
ALTER TABLE IF EXISTS ONLY public.customer_group_customer DROP CONSTRAINT IF EXISTS customer_group_customer_customer_group_id_foreign;
ALTER TABLE IF EXISTS ONLY public.customer_address DROP CONSTRAINT IF EXISTS customer_address_customer_id_foreign;
ALTER TABLE IF EXISTS ONLY public.credit_line DROP CONSTRAINT IF EXISTS credit_line_cart_id_foreign;
ALTER TABLE IF EXISTS ONLY public.composer_bank_account DROP CONSTRAINT IF EXISTS composer_bank_account_composer_id_foreign;
ALTER TABLE IF EXISTS ONLY public.cart_shipping_method_tax_line DROP CONSTRAINT IF EXISTS cart_shipping_method_tax_line_shipping_method_id_foreign;
ALTER TABLE IF EXISTS ONLY public.cart_shipping_method DROP CONSTRAINT IF EXISTS cart_shipping_method_cart_id_foreign;
ALTER TABLE IF EXISTS ONLY public.cart_shipping_method_adjustment DROP CONSTRAINT IF EXISTS cart_shipping_method_adjustment_shipping_method_id_foreign;
ALTER TABLE IF EXISTS ONLY public.cart DROP CONSTRAINT IF EXISTS cart_shipping_address_id_foreign;
ALTER TABLE IF EXISTS ONLY public.cart_line_item_tax_line DROP CONSTRAINT IF EXISTS cart_line_item_tax_line_item_id_foreign;
ALTER TABLE IF EXISTS ONLY public.cart_line_item DROP CONSTRAINT IF EXISTS cart_line_item_cart_id_foreign;
ALTER TABLE IF EXISTS ONLY public.cart_line_item_adjustment DROP CONSTRAINT IF EXISTS cart_line_item_adjustment_item_id_foreign;
ALTER TABLE IF EXISTS ONLY public.cart DROP CONSTRAINT IF EXISTS cart_billing_address_id_foreign;
ALTER TABLE IF EXISTS ONLY public.capture DROP CONSTRAINT IF EXISTS capture_payment_id_foreign;
ALTER TABLE IF EXISTS ONLY public.auth_verification DROP CONSTRAINT IF EXISTS auth_verification_auth_identity_id_foreign;
ALTER TABLE IF EXISTS ONLY public.auth_password_reset_token DROP CONSTRAINT IF EXISTS auth_password_reset_token_provider_identity_id_foreign;
ALTER TABLE IF EXISTS ONLY public.auth_password_reset_token DROP CONSTRAINT IF EXISTS auth_password_reset_token_auth_identity_id_foreign;
ALTER TABLE IF EXISTS ONLY public.auth_mfa_recovery_code DROP CONSTRAINT IF EXISTS auth_mfa_recovery_code_auth_identity_id_foreign;
ALTER TABLE IF EXISTS ONLY public.auth_mfa_factor DROP CONSTRAINT IF EXISTS auth_mfa_factor_auth_identity_id_foreign;
ALTER TABLE IF EXISTS ONLY public.application_method_target_rules DROP CONSTRAINT IF EXISTS application_method_target_rules_promotion_rule_id_foreign;
ALTER TABLE IF EXISTS ONLY public.application_method_target_rules DROP CONSTRAINT IF EXISTS application_method_target_rules_application_method_id_foreign;
ALTER TABLE IF EXISTS ONLY public.application_method_buy_rules DROP CONSTRAINT IF EXISTS application_method_buy_rules_promotion_rule_id_foreign;
ALTER TABLE IF EXISTS ONLY public.application_method_buy_rules DROP CONSTRAINT IF EXISTS application_method_buy_rules_application_method_id_foreign;
ALTER TABLE IF EXISTS ONLY public.tax_region DROP CONSTRAINT IF EXISTS "FK_tax_region_provider_id";
ALTER TABLE IF EXISTS ONLY public.tax_region DROP CONSTRAINT IF EXISTS "FK_tax_region_parent_id";
ALTER TABLE IF EXISTS ONLY public.tax_rate DROP CONSTRAINT IF EXISTS "FK_tax_rate_tax_region_id";
ALTER TABLE IF EXISTS ONLY public.tax_rate_rule DROP CONSTRAINT IF EXISTS "FK_tax_rate_rule_tax_rate_id";
DROP INDEX IF EXISTS public.idx_script_name_unique;
DROP INDEX IF EXISTS public."IDX_workflow_execution_workflow_id_transaction_id_run_id_unique";
DROP INDEX IF EXISTS public."IDX_workflow_execution_workflow_id_transaction_id";
DROP INDEX IF EXISTS public."IDX_workflow_execution_workflow_id";
DROP INDEX IF EXISTS public."IDX_workflow_execution_updated_at_retention_time";
DROP INDEX IF EXISTS public."IDX_workflow_execution_transaction_id";
DROP INDEX IF EXISTS public."IDX_workflow_execution_state_updated_at";
DROP INDEX IF EXISTS public."IDX_workflow_execution_state";
DROP INDEX IF EXISTS public."IDX_workflow_execution_run_id";
DROP INDEX IF EXISTS public."IDX_workflow_execution_retention_time_updated_at_state";
DROP INDEX IF EXISTS public."IDX_workflow_execution_id";
DROP INDEX IF EXISTS public."IDX_workflow_execution_deleted_at";
DROP INDEX IF EXISTS public."IDX_view_configuration_user_id";
DROP INDEX IF EXISTS public."IDX_view_configuration_entity_user_id";
DROP INDEX IF EXISTS public."IDX_view_configuration_entity_is_system_default";
DROP INDEX IF EXISTS public."IDX_view_configuration_deleted_at";
DROP INDEX IF EXISTS public."IDX_variant_id_52b23597";
DROP INDEX IF EXISTS public."IDX_variant_id_17b4c4e35";
DROP INDEX IF EXISTS public."IDX_user_preference_user_id_key_unique";
DROP INDEX IF EXISTS public."IDX_user_preference_user_id";
DROP INDEX IF EXISTS public."IDX_user_preference_deleted_at";
DROP INDEX IF EXISTS public."IDX_user_id_64ff0c4c";
DROP INDEX IF EXISTS public."IDX_user_email_unique";
DROP INDEX IF EXISTS public."IDX_user_deleted_at";
DROP INDEX IF EXISTS public."IDX_unique_promotion_code";
DROP INDEX IF EXISTS public."IDX_type_value_unique";
DROP INDEX IF EXISTS public."IDX_tax_region_unique_country_province";
DROP INDEX IF EXISTS public."IDX_tax_region_unique_country_nullable_province";
DROP INDEX IF EXISTS public."IDX_tax_region_provider_id";
DROP INDEX IF EXISTS public."IDX_tax_region_parent_id";
DROP INDEX IF EXISTS public."IDX_tax_region_deleted_at";
DROP INDEX IF EXISTS public."IDX_tax_rate_tax_region_id";
DROP INDEX IF EXISTS public."IDX_tax_rate_rule_unique_rate_reference";
DROP INDEX IF EXISTS public."IDX_tax_rate_rule_tax_rate_id";
DROP INDEX IF EXISTS public."IDX_tax_rate_rule_reference_id";
DROP INDEX IF EXISTS public."IDX_tax_rate_rule_deleted_at";
DROP INDEX IF EXISTS public."IDX_tax_rate_deleted_at";
DROP INDEX IF EXISTS public."IDX_tax_provider_deleted_at";
DROP INDEX IF EXISTS public."IDX_tag_value_unique";
DROP INDEX IF EXISTS public."IDX_store_locale_store_id";
DROP INDEX IF EXISTS public."IDX_store_locale_deleted_at";
DROP INDEX IF EXISTS public."IDX_store_deleted_at";
DROP INDEX IF EXISTS public."IDX_store_currency_store_id";
DROP INDEX IF EXISTS public."IDX_store_currency_deleted_at";
DROP INDEX IF EXISTS public."IDX_stock_location_id_26d06f470";
DROP INDEX IF EXISTS public."IDX_stock_location_id_-e88adb96";
DROP INDEX IF EXISTS public."IDX_stock_location_id_-1e5992737";
DROP INDEX IF EXISTS public."IDX_stock_location_deleted_at";
DROP INDEX IF EXISTS public."IDX_stock_location_address_id_unique";
DROP INDEX IF EXISTS public."IDX_stock_location_address_deleted_at";
DROP INDEX IF EXISTS public."IDX_single_default_region";
DROP INDEX IF EXISTS public."IDX_shipping_profile_name_unique";
DROP INDEX IF EXISTS public."IDX_shipping_profile_id_17a262437";
DROP INDEX IF EXISTS public."IDX_shipping_profile_deleted_at";
DROP INDEX IF EXISTS public."IDX_shipping_option_type_deleted_at";
DROP INDEX IF EXISTS public."IDX_shipping_option_shipping_profile_id";
DROP INDEX IF EXISTS public."IDX_shipping_option_shipping_option_type_id";
DROP INDEX IF EXISTS public."IDX_shipping_option_service_zone_id";
DROP INDEX IF EXISTS public."IDX_shipping_option_rule_shipping_option_id";
DROP INDEX IF EXISTS public."IDX_shipping_option_rule_deleted_at";
DROP INDEX IF EXISTS public."IDX_shipping_option_provider_id";
DROP INDEX IF EXISTS public."IDX_shipping_option_id_ba32fa9c";
DROP INDEX IF EXISTS public."IDX_shipping_option_deleted_at";
DROP INDEX IF EXISTS public."IDX_shipping_method_tax_line_tax_rate_id";
DROP INDEX IF EXISTS public."IDX_shipping_method_option_id";
DROP INDEX IF EXISTS public."IDX_shipping_method_adjustment_promotion_id";
DROP INDEX IF EXISTS public."IDX_service_zone_name_unique";
DROP INDEX IF EXISTS public."IDX_service_zone_fulfillment_set_id";
DROP INDEX IF EXISTS public."IDX_service_zone_deleted_at";
DROP INDEX IF EXISTS public."IDX_score_slug_unique";
DROP INDEX IF EXISTS public."IDX_score_deleted_at";
DROP INDEX IF EXISTS public."IDX_sales_channel_id_26d06f470";
DROP INDEX IF EXISTS public."IDX_sales_channel_id_20b454295";
DROP INDEX IF EXISTS public."IDX_sales_channel_id_-1d67bae40";
DROP INDEX IF EXISTS public."IDX_sales_channel_deleted_at";
DROP INDEX IF EXISTS public."IDX_return_reason_value";
DROP INDEX IF EXISTS public."IDX_return_reason_parent_return_reason_id";
DROP INDEX IF EXISTS public."IDX_return_order_id";
DROP INDEX IF EXISTS public."IDX_return_item_return_id";
DROP INDEX IF EXISTS public."IDX_return_item_reason_id";
DROP INDEX IF EXISTS public."IDX_return_item_item_id";
DROP INDEX IF EXISTS public."IDX_return_item_deleted_at";
DROP INDEX IF EXISTS public."IDX_return_id_-31ea43a";
DROP INDEX IF EXISTS public."IDX_return_exchange_id";
DROP INDEX IF EXISTS public."IDX_return_display_id";
DROP INDEX IF EXISTS public."IDX_return_claim_id";
DROP INDEX IF EXISTS public."IDX_reservation_item_location_id";
DROP INDEX IF EXISTS public."IDX_reservation_item_line_item_id";
DROP INDEX IF EXISTS public."IDX_reservation_item_inventory_item_id";
DROP INDEX IF EXISTS public."IDX_reservation_item_deleted_at";
DROP INDEX IF EXISTS public."IDX_region_id_1c934dab0";
DROP INDEX IF EXISTS public."IDX_region_deleted_at";
DROP INDEX IF EXISTS public."IDX_region_country_region_id_iso_2_unique";
DROP INDEX IF EXISTS public."IDX_region_country_region_id";
DROP INDEX IF EXISTS public."IDX_region_country_deleted_at";
DROP INDEX IF EXISTS public."IDX_refund_refund_reason_id";
DROP INDEX IF EXISTS public."IDX_refund_reason_deleted_at";
DROP INDEX IF EXISTS public."IDX_refund_payment_id";
DROP INDEX IF EXISTS public."IDX_refund_deleted_at";
DROP INDEX IF EXISTS public."IDX_rbac_role_id_64ff0c4c";
DROP INDEX IF EXISTS public."IDX_rbac_role_id_-85069d44";
DROP INDEX IF EXISTS public."IDX_publishable_key_id_-1d67bae40";
DROP INDEX IF EXISTS public."IDX_provider_identity_provider_entity_id";
DROP INDEX IF EXISTS public."IDX_provider_identity_deleted_at";
DROP INDEX IF EXISTS public."IDX_provider_identity_auth_identity_id";
DROP INDEX IF EXISTS public."IDX_property_label_entity_property_unique";
DROP INDEX IF EXISTS public."IDX_property_label_entity";
DROP INDEX IF EXISTS public."IDX_property_label_deleted_at";
DROP INDEX IF EXISTS public."IDX_promotion_type";
DROP INDEX IF EXISTS public."IDX_promotion_status";
DROP INDEX IF EXISTS public."IDX_promotion_rule_value_value";
DROP INDEX IF EXISTS public."IDX_promotion_rule_value_rule_id_value";
DROP INDEX IF EXISTS public."IDX_promotion_rule_value_promotion_rule_id";
DROP INDEX IF EXISTS public."IDX_promotion_rule_value_deleted_at";
DROP INDEX IF EXISTS public."IDX_promotion_rule_operator";
DROP INDEX IF EXISTS public."IDX_promotion_rule_deleted_at";
DROP INDEX IF EXISTS public."IDX_promotion_rule_attribute_operator_id";
DROP INDEX IF EXISTS public."IDX_promotion_rule_attribute_operator";
DROP INDEX IF EXISTS public."IDX_promotion_rule_attribute";
DROP INDEX IF EXISTS public."IDX_promotion_is_automatic";
DROP INDEX IF EXISTS public."IDX_promotion_id_-a9d4a70b";
DROP INDEX IF EXISTS public."IDX_promotion_id_-71518339";
DROP INDEX IF EXISTS public."IDX_promotion_deleted_at";
DROP INDEX IF EXISTS public."IDX_promotion_campaign_id";
DROP INDEX IF EXISTS public."IDX_promotion_campaign_deleted_at";
DROP INDEX IF EXISTS public."IDX_promotion_campaign_campaign_identifier_unique";
DROP INDEX IF EXISTS public."IDX_promotion_campaign_budget_usage_deleted_at";
DROP INDEX IF EXISTS public."IDX_promotion_campaign_budget_usage_budget_id";
DROP INDEX IF EXISTS public."IDX_promotion_campaign_budget_usage_attribute_value_budget_id_u";
DROP INDEX IF EXISTS public."IDX_promotion_campaign_budget_deleted_at";
DROP INDEX IF EXISTS public."IDX_promotion_campaign_budget_campaign_id_unique";
DROP INDEX IF EXISTS public."IDX_promotion_application_method_promotion_id_unique";
DROP INDEX IF EXISTS public."IDX_promotion_application_method_deleted_at";
DROP INDEX IF EXISTS public."IDX_promotion_application_method_currency_code";
DROP INDEX IF EXISTS public."IDX_product_variant_upc_unique";
DROP INDEX IF EXISTS public."IDX_product_variant_sku_unique";
DROP INDEX IF EXISTS public."IDX_product_variant_product_image_variant_id";
DROP INDEX IF EXISTS public."IDX_product_variant_product_image_image_id";
DROP INDEX IF EXISTS public."IDX_product_variant_product_image_deleted_at";
DROP INDEX IF EXISTS public."IDX_product_variant_product_id";
DROP INDEX IF EXISTS public."IDX_product_variant_id_product_id";
DROP INDEX IF EXISTS public."IDX_product_variant_ean_unique";
DROP INDEX IF EXISTS public."IDX_product_variant_deleted_at";
DROP INDEX IF EXISTS public."IDX_product_variant_barcode_unique";
DROP INDEX IF EXISTS public."IDX_product_type_id";
DROP INDEX IF EXISTS public."IDX_product_type_deleted_at";
DROP INDEX IF EXISTS public."IDX_product_tag_deleted_at";
DROP INDEX IF EXISTS public."IDX_product_status";
DROP INDEX IF EXISTS public."IDX_product_product_option_value_product_product_option_id";
DROP INDEX IF EXISTS public."IDX_product_product_option_value_product_option_value_id";
DROP INDEX IF EXISTS public."IDX_product_product_option_value_deleted_at";
DROP INDEX IF EXISTS public."IDX_product_product_option_product_option_id";
DROP INDEX IF EXISTS public."IDX_product_product_option_product_id";
DROP INDEX IF EXISTS public."IDX_product_product_option_deleted_at";
DROP INDEX IF EXISTS public."IDX_product_option_value_option_id";
DROP INDEX IF EXISTS public."IDX_product_option_value_deleted_at";
DROP INDEX IF EXISTS public."IDX_product_option_global_title_unique";
DROP INDEX IF EXISTS public."IDX_product_option_deleted_at";
DROP INDEX IF EXISTS public."IDX_product_image_url_rank_product_id";
DROP INDEX IF EXISTS public."IDX_product_image_url";
DROP INDEX IF EXISTS public."IDX_product_image_rank_product_id";
DROP INDEX IF EXISTS public."IDX_product_image_rank";
DROP INDEX IF EXISTS public."IDX_product_id_20b454295";
DROP INDEX IF EXISTS public."IDX_product_id_17a262437";
DROP INDEX IF EXISTS public."IDX_product_handle_unique";
DROP INDEX IF EXISTS public."IDX_product_deleted_at";
DROP INDEX IF EXISTS public."IDX_product_collection_id";
DROP INDEX IF EXISTS public."IDX_product_collection_deleted_at";
DROP INDEX IF EXISTS public."IDX_product_category_path";
DROP INDEX IF EXISTS public."IDX_product_category_parent_category_id";
DROP INDEX IF EXISTS public."IDX_price_set_id_ba32fa9c";
DROP INDEX IF EXISTS public."IDX_price_set_id_52b23597";
DROP INDEX IF EXISTS public."IDX_price_set_deleted_at";
DROP INDEX IF EXISTS public."IDX_price_rule_price_id_attribute_operator_unique";
DROP INDEX IF EXISTS public."IDX_price_rule_price_id";
DROP INDEX IF EXISTS public."IDX_price_rule_operator_value";
DROP INDEX IF EXISTS public."IDX_price_rule_operator";
DROP INDEX IF EXISTS public."IDX_price_rule_deleted_at";
DROP INDEX IF EXISTS public."IDX_price_rule_attribute_value_price_id";
DROP INDEX IF EXISTS public."IDX_price_rule_attribute_value";
DROP INDEX IF EXISTS public."IDX_price_rule_attribute";
DROP INDEX IF EXISTS public."IDX_price_price_set_id";
DROP INDEX IF EXISTS public."IDX_price_price_list_id";
DROP INDEX IF EXISTS public."IDX_price_preference_deleted_at";
DROP INDEX IF EXISTS public."IDX_price_preference_attribute_value";
DROP INDEX IF EXISTS public."IDX_price_list_rule_value";
DROP INDEX IF EXISTS public."IDX_price_list_rule_price_list_id";
DROP INDEX IF EXISTS public."IDX_price_list_rule_deleted_at";
DROP INDEX IF EXISTS public."IDX_price_list_rule_attribute";
DROP INDEX IF EXISTS public."IDX_price_list_id_status_starts_at_ends_at";
DROP INDEX IF EXISTS public."IDX_price_list_deleted_at";
DROP INDEX IF EXISTS public."IDX_price_deleted_at";
DROP INDEX IF EXISTS public."IDX_price_currency_code";
DROP INDEX IF EXISTS public."IDX_payout_item_deleted_at";
DROP INDEX IF EXISTS public."IDX_payout_item_batch_id";
DROP INDEX IF EXISTS public."IDX_payout_batch_deleted_at";
DROP INDEX IF EXISTS public."IDX_payout_batch_batch_number_unique";
DROP INDEX IF EXISTS public."IDX_payment_session_payment_collection_id";
DROP INDEX IF EXISTS public."IDX_payment_session_deleted_at";
DROP INDEX IF EXISTS public."IDX_payment_provider_id_1c934dab0";
DROP INDEX IF EXISTS public."IDX_payment_provider_id";
DROP INDEX IF EXISTS public."IDX_payment_provider_deleted_at";
DROP INDEX IF EXISTS public."IDX_payment_payment_session_id_unique";
DROP INDEX IF EXISTS public."IDX_payment_payment_session_id";
DROP INDEX IF EXISTS public."IDX_payment_payment_collection_id";
DROP INDEX IF EXISTS public."IDX_payment_deleted_at";
DROP INDEX IF EXISTS public."IDX_payment_collection_id_f42b9949";
DROP INDEX IF EXISTS public."IDX_payment_collection_id_-4a39f6c9";
DROP INDEX IF EXISTS public."IDX_payment_collection_deleted_at";
DROP INDEX IF EXISTS public."IDX_order_transaction_return_id";
DROP INDEX IF EXISTS public."IDX_order_transaction_reference_id";
DROP INDEX IF EXISTS public."IDX_order_transaction_order_id_version";
DROP INDEX IF EXISTS public."IDX_order_transaction_order_id";
DROP INDEX IF EXISTS public."IDX_order_transaction_exchange_id";
DROP INDEX IF EXISTS public."IDX_order_transaction_currency_code";
DROP INDEX IF EXISTS public."IDX_order_transaction_claim_id";
DROP INDEX IF EXISTS public."IDX_order_summary_order_id_version";
DROP INDEX IF EXISTS public."IDX_order_summary_deleted_at";
DROP INDEX IF EXISTS public."IDX_order_shipping_shipping_method_id";
DROP INDEX IF EXISTS public."IDX_order_shipping_return_id";
DROP INDEX IF EXISTS public."IDX_order_shipping_order_id_version";
DROP INDEX IF EXISTS public."IDX_order_shipping_order_id";
DROP INDEX IF EXISTS public."IDX_order_shipping_method_tax_line_shipping_method_id";
DROP INDEX IF EXISTS public."IDX_order_shipping_method_shipping_option_id";
DROP INDEX IF EXISTS public."IDX_order_shipping_method_adjustment_version_shipping_method";
DROP INDEX IF EXISTS public."IDX_order_shipping_method_adjustment_shipping_method_id";
DROP INDEX IF EXISTS public."IDX_order_shipping_item_id";
DROP INDEX IF EXISTS public."IDX_order_shipping_exchange_id";
DROP INDEX IF EXISTS public."IDX_order_shipping_deleted_at";
DROP INDEX IF EXISTS public."IDX_order_shipping_claim_id";
DROP INDEX IF EXISTS public."IDX_order_shipping_address_id";
DROP INDEX IF EXISTS public."IDX_order_sales_channel_id";
DROP INDEX IF EXISTS public."IDX_order_region_id";
DROP INDEX IF EXISTS public."IDX_order_line_item_variant_id";
DROP INDEX IF EXISTS public."IDX_order_line_item_tax_line_item_id";
DROP INDEX IF EXISTS public."IDX_order_line_item_product_id";
DROP INDEX IF EXISTS public."IDX_order_line_item_adjustment_item_id";
DROP INDEX IF EXISTS public."IDX_order_item_order_id_version";
DROP INDEX IF EXISTS public."IDX_order_item_order_id";
DROP INDEX IF EXISTS public."IDX_order_item_item_id";
DROP INDEX IF EXISTS public."IDX_order_item_deleted_at";
DROP INDEX IF EXISTS public."IDX_order_is_draft_order";
DROP INDEX IF EXISTS public."IDX_order_id_f42b9949";
DROP INDEX IF EXISTS public."IDX_order_id_-e8d2543e";
DROP INDEX IF EXISTS public."IDX_order_id_-71518339";
DROP INDEX IF EXISTS public."IDX_order_id_-71069c16";
DROP INDEX IF EXISTS public."IDX_order_exchange_return_id";
DROP INDEX IF EXISTS public."IDX_order_exchange_order_id";
DROP INDEX IF EXISTS public."IDX_order_exchange_item_item_id";
DROP INDEX IF EXISTS public."IDX_order_exchange_item_exchange_id";
DROP INDEX IF EXISTS public."IDX_order_exchange_item_deleted_at";
DROP INDEX IF EXISTS public."IDX_order_exchange_display_id";
DROP INDEX IF EXISTS public."IDX_order_exchange_deleted_at";
DROP INDEX IF EXISTS public."IDX_order_display_id";
DROP INDEX IF EXISTS public."IDX_order_deleted_at";
DROP INDEX IF EXISTS public."IDX_order_customer_id";
DROP INDEX IF EXISTS public."IDX_order_custom_display_id";
DROP INDEX IF EXISTS public."IDX_order_currency_code";
DROP INDEX IF EXISTS public."IDX_order_credit_line_order_id_version";
DROP INDEX IF EXISTS public."IDX_order_credit_line_order_id";
DROP INDEX IF EXISTS public."IDX_order_credit_line_deleted_at";
DROP INDEX IF EXISTS public."IDX_order_claim_return_id";
DROP INDEX IF EXISTS public."IDX_order_claim_order_id";
DROP INDEX IF EXISTS public."IDX_order_claim_item_item_id";
DROP INDEX IF EXISTS public."IDX_order_claim_item_image_deleted_at";
DROP INDEX IF EXISTS public."IDX_order_claim_item_image_claim_item_id";
DROP INDEX IF EXISTS public."IDX_order_claim_item_deleted_at";
DROP INDEX IF EXISTS public."IDX_order_claim_item_claim_id";
DROP INDEX IF EXISTS public."IDX_order_claim_display_id";
DROP INDEX IF EXISTS public."IDX_order_claim_deleted_at";
DROP INDEX IF EXISTS public."IDX_order_change_version";
DROP INDEX IF EXISTS public."IDX_order_change_status";
DROP INDEX IF EXISTS public."IDX_order_change_return_id";
DROP INDEX IF EXISTS public."IDX_order_change_order_id_version";
DROP INDEX IF EXISTS public."IDX_order_change_order_id";
DROP INDEX IF EXISTS public."IDX_order_change_exchange_id";
DROP INDEX IF EXISTS public."IDX_order_change_deleted_at";
DROP INDEX IF EXISTS public."IDX_order_change_claim_id";
DROP INDEX IF EXISTS public."IDX_order_change_change_type";
DROP INDEX IF EXISTS public."IDX_order_change_action_return_id";
DROP INDEX IF EXISTS public."IDX_order_change_action_ordering";
DROP INDEX IF EXISTS public."IDX_order_change_action_order_id";
DROP INDEX IF EXISTS public."IDX_order_change_action_order_change_id";
DROP INDEX IF EXISTS public."IDX_order_change_action_exchange_id";
DROP INDEX IF EXISTS public."IDX_order_change_action_deleted_at";
DROP INDEX IF EXISTS public."IDX_order_change_action_claim_id";
DROP INDEX IF EXISTS public."IDX_order_billing_address_id";
DROP INDEX IF EXISTS public."IDX_order_address_deleted_at";
DROP INDEX IF EXISTS public."IDX_order_address_customer_id";
DROP INDEX IF EXISTS public."IDX_option_value_option_id_unique";
DROP INDEX IF EXISTS public."IDX_notification_receiver_id";
DROP INDEX IF EXISTS public."IDX_notification_provider_id";
DROP INDEX IF EXISTS public."IDX_notification_provider_deleted_at";
DROP INDEX IF EXISTS public."IDX_notification_idempotency_key_unique";
DROP INDEX IF EXISTS public."IDX_notification_deleted_at";
DROP INDEX IF EXISTS public."IDX_line_item_variant_id";
DROP INDEX IF EXISTS public."IDX_line_item_tax_line_tax_rate_id";
DROP INDEX IF EXISTS public."IDX_line_item_product_type_id";
DROP INDEX IF EXISTS public."IDX_line_item_product_id";
DROP INDEX IF EXISTS public."IDX_line_item_adjustment_promotion_id";
DROP INDEX IF EXISTS public."IDX_layout_configuration_zone_user_id_unique";
DROP INDEX IF EXISTS public."IDX_layout_configuration_zone_unique";
DROP INDEX IF EXISTS public."IDX_layout_configuration_deleted_at";
DROP INDEX IF EXISTS public."IDX_invite_token";
DROP INDEX IF EXISTS public."IDX_invite_id_-85069d44";
DROP INDEX IF EXISTS public."IDX_invite_email_unique";
DROP INDEX IF EXISTS public."IDX_invite_deleted_at";
DROP INDEX IF EXISTS public."IDX_inventory_level_location_id_inventory_item_id";
DROP INDEX IF EXISTS public."IDX_inventory_level_location_id";
DROP INDEX IF EXISTS public."IDX_inventory_level_inventory_item_id";
DROP INDEX IF EXISTS public."IDX_inventory_level_deleted_at";
DROP INDEX IF EXISTS public."IDX_inventory_item_sku";
DROP INDEX IF EXISTS public."IDX_inventory_item_id_17b4c4e35";
DROP INDEX IF EXISTS public."IDX_inventory_item_deleted_at";
DROP INDEX IF EXISTS public."IDX_image_product_id";
DROP INDEX IF EXISTS public."IDX_image_deleted_at";
DROP INDEX IF EXISTS public."IDX_id_f42b9949";
DROP INDEX IF EXISTS public."IDX_id_ba32fa9c";
DROP INDEX IF EXISTS public."IDX_id_64ff0c4c";
DROP INDEX IF EXISTS public."IDX_id_5cb3a0c0";
DROP INDEX IF EXISTS public."IDX_id_52b23597";
DROP INDEX IF EXISTS public."IDX_id_26d06f470";
DROP INDEX IF EXISTS public."IDX_id_20b454295";
DROP INDEX IF EXISTS public."IDX_id_1c934dab0";
DROP INDEX IF EXISTS public."IDX_id_17b4c4e35";
DROP INDEX IF EXISTS public."IDX_id_17a262437";
DROP INDEX IF EXISTS public."IDX_id_-e8d2543e";
DROP INDEX IF EXISTS public."IDX_id_-e88adb96";
DROP INDEX IF EXISTS public."IDX_id_-a9d4a70b";
DROP INDEX IF EXISTS public."IDX_id_-85069d44";
DROP INDEX IF EXISTS public."IDX_id_-71518339";
DROP INDEX IF EXISTS public."IDX_id_-71069c16";
DROP INDEX IF EXISTS public."IDX_id_-4a39f6c9";
DROP INDEX IF EXISTS public."IDX_id_-31ea43a";
DROP INDEX IF EXISTS public."IDX_id_-1e5992737";
DROP INDEX IF EXISTS public."IDX_id_-1d67bae40";
DROP INDEX IF EXISTS public."IDX_hero_content_deleted_at";
DROP INDEX IF EXISTS public."IDX_geo_zone_service_zone_id";
DROP INDEX IF EXISTS public."IDX_geo_zone_province_code";
DROP INDEX IF EXISTS public."IDX_geo_zone_deleted_at";
DROP INDEX IF EXISTS public."IDX_geo_zone_country_code";
DROP INDEX IF EXISTS public."IDX_geo_zone_city";
DROP INDEX IF EXISTS public."IDX_fulfillment_shipping_option_id";
DROP INDEX IF EXISTS public."IDX_fulfillment_set_name_unique";
DROP INDEX IF EXISTS public."IDX_fulfillment_set_id_-e88adb96";
DROP INDEX IF EXISTS public."IDX_fulfillment_set_deleted_at";
DROP INDEX IF EXISTS public."IDX_fulfillment_provider_id_-1e5992737";
DROP INDEX IF EXISTS public."IDX_fulfillment_provider_deleted_at";
DROP INDEX IF EXISTS public."IDX_fulfillment_location_id";
DROP INDEX IF EXISTS public."IDX_fulfillment_label_fulfillment_id";
DROP INDEX IF EXISTS public."IDX_fulfillment_label_deleted_at";
DROP INDEX IF EXISTS public."IDX_fulfillment_item_line_item_id";
DROP INDEX IF EXISTS public."IDX_fulfillment_item_inventory_item_id";
DROP INDEX IF EXISTS public."IDX_fulfillment_item_fulfillment_id";
DROP INDEX IF EXISTS public."IDX_fulfillment_item_deleted_at";
DROP INDEX IF EXISTS public."IDX_fulfillment_id_-e8d2543e";
DROP INDEX IF EXISTS public."IDX_fulfillment_id_-31ea43a";
DROP INDEX IF EXISTS public."IDX_fulfillment_deleted_at";
DROP INDEX IF EXISTS public."IDX_fulfillment_address_deleted_at";
DROP INDEX IF EXISTS public."IDX_deleted_at_f42b9949";
DROP INDEX IF EXISTS public."IDX_deleted_at_ba32fa9c";
DROP INDEX IF EXISTS public."IDX_deleted_at_64ff0c4c";
DROP INDEX IF EXISTS public."IDX_deleted_at_5cb3a0c0";
DROP INDEX IF EXISTS public."IDX_deleted_at_52b23597";
DROP INDEX IF EXISTS public."IDX_deleted_at_26d06f470";
DROP INDEX IF EXISTS public."IDX_deleted_at_20b454295";
DROP INDEX IF EXISTS public."IDX_deleted_at_1c934dab0";
DROP INDEX IF EXISTS public."IDX_deleted_at_17b4c4e35";
DROP INDEX IF EXISTS public."IDX_deleted_at_17a262437";
DROP INDEX IF EXISTS public."IDX_deleted_at_-e8d2543e";
DROP INDEX IF EXISTS public."IDX_deleted_at_-e88adb96";
DROP INDEX IF EXISTS public."IDX_deleted_at_-a9d4a70b";
DROP INDEX IF EXISTS public."IDX_deleted_at_-85069d44";
DROP INDEX IF EXISTS public."IDX_deleted_at_-71518339";
DROP INDEX IF EXISTS public."IDX_deleted_at_-71069c16";
DROP INDEX IF EXISTS public."IDX_deleted_at_-4a39f6c9";
DROP INDEX IF EXISTS public."IDX_deleted_at_-31ea43a";
DROP INDEX IF EXISTS public."IDX_deleted_at_-1e5992737";
DROP INDEX IF EXISTS public."IDX_deleted_at_-1d67bae40";
DROP INDEX IF EXISTS public."IDX_customer_id_5cb3a0c0";
DROP INDEX IF EXISTS public."IDX_customer_group_name_unique";
DROP INDEX IF EXISTS public."IDX_customer_group_deleted_at";
DROP INDEX IF EXISTS public."IDX_customer_group_customer_deleted_at";
DROP INDEX IF EXISTS public."IDX_customer_group_customer_customer_id";
DROP INDEX IF EXISTS public."IDX_customer_group_customer_customer_group_id";
DROP INDEX IF EXISTS public."IDX_customer_email_has_account_unique";
DROP INDEX IF EXISTS public."IDX_customer_download_download_token_unique";
DROP INDEX IF EXISTS public."IDX_customer_download_deleted_at";
DROP INDEX IF EXISTS public."IDX_customer_deleted_at";
DROP INDEX IF EXISTS public."IDX_customer_address_unique_customer_shipping";
DROP INDEX IF EXISTS public."IDX_customer_address_unique_customer_billing";
DROP INDEX IF EXISTS public."IDX_customer_address_deleted_at";
DROP INDEX IF EXISTS public."IDX_customer_address_customer_id";
DROP INDEX IF EXISTS public."IDX_customer_account_email_unique";
DROP INDEX IF EXISTS public."IDX_customer_account_deleted_at";
DROP INDEX IF EXISTS public."IDX_credit_line_deleted_at";
DROP INDEX IF EXISTS public."IDX_credit_line_cart_id";
DROP INDEX IF EXISTS public."IDX_composer_slug_unique";
DROP INDEX IF EXISTS public."IDX_composer_deleted_at";
DROP INDEX IF EXISTS public."IDX_composer_bank_account_deleted_at";
DROP INDEX IF EXISTS public."IDX_composer_bank_account_composer_id_unique";
DROP INDEX IF EXISTS public."IDX_collection_handle_unique";
DROP INDEX IF EXISTS public."IDX_category_handle_unique";
DROP INDEX IF EXISTS public."IDX_cart_shipping_method_tax_line_shipping_method_id";
DROP INDEX IF EXISTS public."IDX_cart_shipping_method_tax_line_deleted_at";
DROP INDEX IF EXISTS public."IDX_cart_shipping_method_deleted_at";
DROP INDEX IF EXISTS public."IDX_cart_shipping_method_cart_id";
DROP INDEX IF EXISTS public."IDX_cart_shipping_method_adjustment_shipping_method_id";
DROP INDEX IF EXISTS public."IDX_cart_shipping_method_adjustment_deleted_at";
DROP INDEX IF EXISTS public."IDX_cart_shipping_address_id";
DROP INDEX IF EXISTS public."IDX_cart_sales_channel_id";
DROP INDEX IF EXISTS public."IDX_cart_region_id";
DROP INDEX IF EXISTS public."IDX_cart_line_item_tax_line_item_id";
DROP INDEX IF EXISTS public."IDX_cart_line_item_tax_line_deleted_at";
DROP INDEX IF EXISTS public."IDX_cart_line_item_deleted_at";
DROP INDEX IF EXISTS public."IDX_cart_line_item_cart_id";
DROP INDEX IF EXISTS public."IDX_cart_line_item_adjustment_item_id";
DROP INDEX IF EXISTS public."IDX_cart_line_item_adjustment_deleted_at";
DROP INDEX IF EXISTS public."IDX_cart_id_-a9d4a70b";
DROP INDEX IF EXISTS public."IDX_cart_id_-71069c16";
DROP INDEX IF EXISTS public."IDX_cart_id_-4a39f6c9";
DROP INDEX IF EXISTS public."IDX_cart_deleted_at";
DROP INDEX IF EXISTS public."IDX_cart_customer_id";
DROP INDEX IF EXISTS public."IDX_cart_currency_code";
DROP INDEX IF EXISTS public."IDX_cart_credit_line_reference_reference_id";
DROP INDEX IF EXISTS public."IDX_cart_billing_address_id";
DROP INDEX IF EXISTS public."IDX_cart_address_deleted_at";
DROP INDEX IF EXISTS public."IDX_capture_payment_id";
DROP INDEX IF EXISTS public."IDX_capture_deleted_at";
DROP INDEX IF EXISTS public."IDX_campaign_budget_type";
DROP INDEX IF EXISTS public."IDX_auth_verification_unique_auth_identity_entity_id_entity_typ";
DROP INDEX IF EXISTS public."IDX_auth_verification_deleted_at";
DROP INDEX IF EXISTS public."IDX_auth_verification_auth_identity_id";
DROP INDEX IF EXISTS public."IDX_auth_password_reset_token_token_hash";
DROP INDEX IF EXISTS public."IDX_auth_password_reset_token_provider_identity_id";
DROP INDEX IF EXISTS public."IDX_auth_password_reset_token_expires_at";
DROP INDEX IF EXISTS public."IDX_auth_password_reset_token_deleted_at";
DROP INDEX IF EXISTS public."IDX_auth_password_reset_token_auth_identity_id";
DROP INDEX IF EXISTS public."IDX_auth_mfa_recovery_code_deleted_at";
DROP INDEX IF EXISTS public."IDX_auth_mfa_recovery_code_auth_identity_id";
DROP INDEX IF EXISTS public."IDX_auth_mfa_recovery_code_auth_identity_code_hash";
DROP INDEX IF EXISTS public."IDX_auth_mfa_factor_deleted_at";
DROP INDEX IF EXISTS public."IDX_auth_mfa_factor_auth_identity_provider_active";
DROP INDEX IF EXISTS public."IDX_auth_mfa_factor_auth_identity_id";
DROP INDEX IF EXISTS public."IDX_auth_identity_deleted_at";
DROP INDEX IF EXISTS public."IDX_application_method_type";
DROP INDEX IF EXISTS public."IDX_application_method_target_type";
DROP INDEX IF EXISTS public."IDX_application_method_allocation";
DROP INDEX IF EXISTS public."IDX_api_key_type";
DROP INDEX IF EXISTS public."IDX_api_key_token_unique";
DROP INDEX IF EXISTS public."IDX_api_key_revoked_at";
DROP INDEX IF EXISTS public."IDX_api_key_redacted";
DROP INDEX IF EXISTS public."IDX_api_key_deleted_at";
DROP INDEX IF EXISTS public."IDX_account_holder_provider_id_external_id_unique";
DROP INDEX IF EXISTS public."IDX_account_holder_id_5cb3a0c0";
DROP INDEX IF EXISTS public."IDX_account_holder_deleted_at";
ALTER TABLE IF EXISTS ONLY public.workflow_execution DROP CONSTRAINT IF EXISTS workflow_execution_pkey;
ALTER TABLE IF EXISTS ONLY public.view_configuration DROP CONSTRAINT IF EXISTS view_configuration_pkey;
ALTER TABLE IF EXISTS ONLY public.user_rbac_role DROP CONSTRAINT IF EXISTS user_rbac_role_pkey;
ALTER TABLE IF EXISTS ONLY public.user_preference DROP CONSTRAINT IF EXISTS user_preference_pkey;
ALTER TABLE IF EXISTS ONLY public."user" DROP CONSTRAINT IF EXISTS user_pkey;
ALTER TABLE IF EXISTS ONLY public.tax_region DROP CONSTRAINT IF EXISTS tax_region_pkey;
ALTER TABLE IF EXISTS ONLY public.tax_rate_rule DROP CONSTRAINT IF EXISTS tax_rate_rule_pkey;
ALTER TABLE IF EXISTS ONLY public.tax_rate DROP CONSTRAINT IF EXISTS tax_rate_pkey;
ALTER TABLE IF EXISTS ONLY public.tax_provider DROP CONSTRAINT IF EXISTS tax_provider_pkey;
ALTER TABLE IF EXISTS ONLY public.store DROP CONSTRAINT IF EXISTS store_pkey;
ALTER TABLE IF EXISTS ONLY public.store_locale DROP CONSTRAINT IF EXISTS store_locale_pkey;
ALTER TABLE IF EXISTS ONLY public.store_currency DROP CONSTRAINT IF EXISTS store_currency_pkey;
ALTER TABLE IF EXISTS ONLY public.stock_location DROP CONSTRAINT IF EXISTS stock_location_pkey;
ALTER TABLE IF EXISTS ONLY public.stock_location_address DROP CONSTRAINT IF EXISTS stock_location_address_pkey;
ALTER TABLE IF EXISTS ONLY public.shipping_profile DROP CONSTRAINT IF EXISTS shipping_profile_pkey;
ALTER TABLE IF EXISTS ONLY public.shipping_option_type DROP CONSTRAINT IF EXISTS shipping_option_type_pkey;
ALTER TABLE IF EXISTS ONLY public.shipping_option_rule DROP CONSTRAINT IF EXISTS shipping_option_rule_pkey;
ALTER TABLE IF EXISTS ONLY public.shipping_option_price_set DROP CONSTRAINT IF EXISTS shipping_option_price_set_pkey;
ALTER TABLE IF EXISTS ONLY public.shipping_option DROP CONSTRAINT IF EXISTS shipping_option_pkey;
ALTER TABLE IF EXISTS ONLY public.service_zone DROP CONSTRAINT IF EXISTS service_zone_pkey;
ALTER TABLE IF EXISTS ONLY public.script_migrations DROP CONSTRAINT IF EXISTS script_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public.score DROP CONSTRAINT IF EXISTS score_pkey;
ALTER TABLE IF EXISTS ONLY public.sales_channel_stock_location DROP CONSTRAINT IF EXISTS sales_channel_stock_location_pkey;
ALTER TABLE IF EXISTS ONLY public.sales_channel DROP CONSTRAINT IF EXISTS sales_channel_pkey;
ALTER TABLE IF EXISTS ONLY public.return_reason DROP CONSTRAINT IF EXISTS return_reason_pkey;
ALTER TABLE IF EXISTS ONLY public.return DROP CONSTRAINT IF EXISTS return_pkey;
ALTER TABLE IF EXISTS ONLY public.return_item DROP CONSTRAINT IF EXISTS return_item_pkey;
ALTER TABLE IF EXISTS ONLY public.return_fulfillment DROP CONSTRAINT IF EXISTS return_fulfillment_pkey;
ALTER TABLE IF EXISTS ONLY public.reservation_item DROP CONSTRAINT IF EXISTS reservation_item_pkey;
ALTER TABLE IF EXISTS ONLY public.region DROP CONSTRAINT IF EXISTS region_pkey;
ALTER TABLE IF EXISTS ONLY public.region_payment_provider DROP CONSTRAINT IF EXISTS region_payment_provider_pkey;
ALTER TABLE IF EXISTS ONLY public.region_country DROP CONSTRAINT IF EXISTS region_country_pkey;
ALTER TABLE IF EXISTS ONLY public.refund_reason DROP CONSTRAINT IF EXISTS refund_reason_pkey;
ALTER TABLE IF EXISTS ONLY public.refund DROP CONSTRAINT IF EXISTS refund_pkey;
ALTER TABLE IF EXISTS ONLY public.publishable_api_key_sales_channel DROP CONSTRAINT IF EXISTS publishable_api_key_sales_channel_pkey;
ALTER TABLE IF EXISTS ONLY public.provider_identity DROP CONSTRAINT IF EXISTS provider_identity_pkey;
ALTER TABLE IF EXISTS ONLY public.property_label DROP CONSTRAINT IF EXISTS property_label_pkey;
ALTER TABLE IF EXISTS ONLY public.promotion_rule_value DROP CONSTRAINT IF EXISTS promotion_rule_value_pkey;
ALTER TABLE IF EXISTS ONLY public.promotion_rule DROP CONSTRAINT IF EXISTS promotion_rule_pkey;
ALTER TABLE IF EXISTS ONLY public.promotion_promotion_rule DROP CONSTRAINT IF EXISTS promotion_promotion_rule_pkey;
ALTER TABLE IF EXISTS ONLY public.promotion DROP CONSTRAINT IF EXISTS promotion_pkey;
ALTER TABLE IF EXISTS ONLY public.promotion_campaign DROP CONSTRAINT IF EXISTS promotion_campaign_pkey;
ALTER TABLE IF EXISTS ONLY public.promotion_campaign_budget_usage DROP CONSTRAINT IF EXISTS promotion_campaign_budget_usage_pkey;
ALTER TABLE IF EXISTS ONLY public.promotion_campaign_budget DROP CONSTRAINT IF EXISTS promotion_campaign_budget_pkey;
ALTER TABLE IF EXISTS ONLY public.promotion_application_method DROP CONSTRAINT IF EXISTS promotion_application_method_pkey;
ALTER TABLE IF EXISTS ONLY public.product_variant_product_image DROP CONSTRAINT IF EXISTS product_variant_product_image_pkey;
ALTER TABLE IF EXISTS ONLY public.product_variant_price_set DROP CONSTRAINT IF EXISTS product_variant_price_set_pkey;
ALTER TABLE IF EXISTS ONLY public.product_variant DROP CONSTRAINT IF EXISTS product_variant_pkey;
ALTER TABLE IF EXISTS ONLY public.product_variant_option DROP CONSTRAINT IF EXISTS product_variant_option_pkey;
ALTER TABLE IF EXISTS ONLY public.product_variant_inventory_item DROP CONSTRAINT IF EXISTS product_variant_inventory_item_pkey;
ALTER TABLE IF EXISTS ONLY public.product_type DROP CONSTRAINT IF EXISTS product_type_pkey;
ALTER TABLE IF EXISTS ONLY public.product_tags DROP CONSTRAINT IF EXISTS product_tags_pkey;
ALTER TABLE IF EXISTS ONLY public.product_tag DROP CONSTRAINT IF EXISTS product_tag_pkey;
ALTER TABLE IF EXISTS ONLY public.product_shipping_profile DROP CONSTRAINT IF EXISTS product_shipping_profile_pkey;
ALTER TABLE IF EXISTS ONLY public.product_sales_channel DROP CONSTRAINT IF EXISTS product_sales_channel_pkey;
ALTER TABLE IF EXISTS ONLY public.product_product_option_value DROP CONSTRAINT IF EXISTS product_product_option_value_pkey;
ALTER TABLE IF EXISTS ONLY public.product_product_option DROP CONSTRAINT IF EXISTS product_product_option_pkey;
ALTER TABLE IF EXISTS ONLY public.product DROP CONSTRAINT IF EXISTS product_pkey;
ALTER TABLE IF EXISTS ONLY public.product_option_value DROP CONSTRAINT IF EXISTS product_option_value_pkey;
ALTER TABLE IF EXISTS ONLY public.product_option DROP CONSTRAINT IF EXISTS product_option_pkey;
ALTER TABLE IF EXISTS ONLY public.product_collection DROP CONSTRAINT IF EXISTS product_collection_pkey;
ALTER TABLE IF EXISTS ONLY public.product_category_product DROP CONSTRAINT IF EXISTS product_category_product_pkey;
ALTER TABLE IF EXISTS ONLY public.product_category DROP CONSTRAINT IF EXISTS product_category_pkey;
ALTER TABLE IF EXISTS ONLY public.price_set DROP CONSTRAINT IF EXISTS price_set_pkey;
ALTER TABLE IF EXISTS ONLY public.price_rule DROP CONSTRAINT IF EXISTS price_rule_pkey;
ALTER TABLE IF EXISTS ONLY public.price_preference DROP CONSTRAINT IF EXISTS price_preference_pkey;
ALTER TABLE IF EXISTS ONLY public.price DROP CONSTRAINT IF EXISTS price_pkey;
ALTER TABLE IF EXISTS ONLY public.price_list_rule DROP CONSTRAINT IF EXISTS price_list_rule_pkey;
ALTER TABLE IF EXISTS ONLY public.price_list DROP CONSTRAINT IF EXISTS price_list_pkey;
ALTER TABLE IF EXISTS ONLY public.platform_settings DROP CONSTRAINT IF EXISTS platform_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.payout_item DROP CONSTRAINT IF EXISTS payout_item_pkey;
ALTER TABLE IF EXISTS ONLY public.payout_batch DROP CONSTRAINT IF EXISTS payout_batch_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_session DROP CONSTRAINT IF EXISTS payment_session_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_provider DROP CONSTRAINT IF EXISTS payment_provider_pkey;
ALTER TABLE IF EXISTS ONLY public.payment DROP CONSTRAINT IF EXISTS payment_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_collection DROP CONSTRAINT IF EXISTS payment_collection_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_collection_payment_providers DROP CONSTRAINT IF EXISTS payment_collection_payment_providers_pkey;
ALTER TABLE IF EXISTS ONLY public.password_reset_otp DROP CONSTRAINT IF EXISTS password_reset_otp_pkey;
ALTER TABLE IF EXISTS ONLY public.order_transaction DROP CONSTRAINT IF EXISTS order_transaction_pkey;
ALTER TABLE IF EXISTS ONLY public.order_summary DROP CONSTRAINT IF EXISTS order_summary_pkey;
ALTER TABLE IF EXISTS ONLY public.order_shipping DROP CONSTRAINT IF EXISTS order_shipping_pkey;
ALTER TABLE IF EXISTS ONLY public.order_shipping_method_tax_line DROP CONSTRAINT IF EXISTS order_shipping_method_tax_line_pkey;
ALTER TABLE IF EXISTS ONLY public.order_shipping_method DROP CONSTRAINT IF EXISTS order_shipping_method_pkey;
ALTER TABLE IF EXISTS ONLY public.order_shipping_method_adjustment DROP CONSTRAINT IF EXISTS order_shipping_method_adjustment_pkey;
ALTER TABLE IF EXISTS ONLY public.order_promotion DROP CONSTRAINT IF EXISTS order_promotion_pkey;
ALTER TABLE IF EXISTS ONLY public."order" DROP CONSTRAINT IF EXISTS order_pkey;
ALTER TABLE IF EXISTS ONLY public.order_payment_collection DROP CONSTRAINT IF EXISTS order_payment_collection_pkey;
ALTER TABLE IF EXISTS ONLY public.order_line_item_tax_line DROP CONSTRAINT IF EXISTS order_line_item_tax_line_pkey;
ALTER TABLE IF EXISTS ONLY public.order_line_item DROP CONSTRAINT IF EXISTS order_line_item_pkey;
ALTER TABLE IF EXISTS ONLY public.order_line_item_adjustment DROP CONSTRAINT IF EXISTS order_line_item_adjustment_pkey;
ALTER TABLE IF EXISTS ONLY public.order_item DROP CONSTRAINT IF EXISTS order_item_pkey;
ALTER TABLE IF EXISTS ONLY public.order_fulfillment DROP CONSTRAINT IF EXISTS order_fulfillment_pkey;
ALTER TABLE IF EXISTS ONLY public.order_exchange DROP CONSTRAINT IF EXISTS order_exchange_pkey;
ALTER TABLE IF EXISTS ONLY public.order_exchange_item DROP CONSTRAINT IF EXISTS order_exchange_item_pkey;
ALTER TABLE IF EXISTS ONLY public.order_credit_line DROP CONSTRAINT IF EXISTS order_credit_line_pkey;
ALTER TABLE IF EXISTS ONLY public.order_claim DROP CONSTRAINT IF EXISTS order_claim_pkey;
ALTER TABLE IF EXISTS ONLY public.order_claim_item DROP CONSTRAINT IF EXISTS order_claim_item_pkey;
ALTER TABLE IF EXISTS ONLY public.order_claim_item_image DROP CONSTRAINT IF EXISTS order_claim_item_image_pkey;
ALTER TABLE IF EXISTS ONLY public.order_change DROP CONSTRAINT IF EXISTS order_change_pkey;
ALTER TABLE IF EXISTS ONLY public.order_change_action DROP CONSTRAINT IF EXISTS order_change_action_pkey;
ALTER TABLE IF EXISTS ONLY public.order_cart DROP CONSTRAINT IF EXISTS order_cart_pkey;
ALTER TABLE IF EXISTS ONLY public.order_address DROP CONSTRAINT IF EXISTS order_address_pkey;
ALTER TABLE IF EXISTS ONLY public.notification_provider DROP CONSTRAINT IF EXISTS notification_provider_pkey;
ALTER TABLE IF EXISTS ONLY public.notification DROP CONSTRAINT IF EXISTS notification_pkey;
ALTER TABLE IF EXISTS ONLY public.mikro_orm_migrations DROP CONSTRAINT IF EXISTS mikro_orm_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public.location_fulfillment_set DROP CONSTRAINT IF EXISTS location_fulfillment_set_pkey;
ALTER TABLE IF EXISTS ONLY public.location_fulfillment_provider DROP CONSTRAINT IF EXISTS location_fulfillment_provider_pkey;
ALTER TABLE IF EXISTS ONLY public.link_module_migrations DROP CONSTRAINT IF EXISTS link_module_migrations_table_name_key;
ALTER TABLE IF EXISTS ONLY public.link_module_migrations DROP CONSTRAINT IF EXISTS link_module_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public.layout_configuration DROP CONSTRAINT IF EXISTS layout_configuration_pkey;
ALTER TABLE IF EXISTS ONLY public.invite_rbac_role DROP CONSTRAINT IF EXISTS invite_rbac_role_pkey;
ALTER TABLE IF EXISTS ONLY public.invite DROP CONSTRAINT IF EXISTS invite_pkey;
ALTER TABLE IF EXISTS ONLY public.inventory_level DROP CONSTRAINT IF EXISTS inventory_level_pkey;
ALTER TABLE IF EXISTS ONLY public.inventory_item DROP CONSTRAINT IF EXISTS inventory_item_pkey;
ALTER TABLE IF EXISTS ONLY public.image DROP CONSTRAINT IF EXISTS image_pkey;
ALTER TABLE IF EXISTS ONLY public.hero_content DROP CONSTRAINT IF EXISTS hero_content_pkey;
ALTER TABLE IF EXISTS ONLY public.geo_zone DROP CONSTRAINT IF EXISTS geo_zone_pkey;
ALTER TABLE IF EXISTS ONLY public.fulfillment_set DROP CONSTRAINT IF EXISTS fulfillment_set_pkey;
ALTER TABLE IF EXISTS ONLY public.fulfillment_provider DROP CONSTRAINT IF EXISTS fulfillment_provider_pkey;
ALTER TABLE IF EXISTS ONLY public.fulfillment DROP CONSTRAINT IF EXISTS fulfillment_pkey;
ALTER TABLE IF EXISTS ONLY public.fulfillment_label DROP CONSTRAINT IF EXISTS fulfillment_label_pkey;
ALTER TABLE IF EXISTS ONLY public.fulfillment_item DROP CONSTRAINT IF EXISTS fulfillment_item_pkey;
ALTER TABLE IF EXISTS ONLY public.fulfillment_address DROP CONSTRAINT IF EXISTS fulfillment_address_pkey;
ALTER TABLE IF EXISTS ONLY public.customer DROP CONSTRAINT IF EXISTS customer_pkey;
ALTER TABLE IF EXISTS ONLY public.customer_group DROP CONSTRAINT IF EXISTS customer_group_pkey;
ALTER TABLE IF EXISTS ONLY public.customer_group_customer DROP CONSTRAINT IF EXISTS customer_group_customer_pkey;
ALTER TABLE IF EXISTS ONLY public.customer_download DROP CONSTRAINT IF EXISTS customer_download_pkey;
ALTER TABLE IF EXISTS ONLY public.customer_address DROP CONSTRAINT IF EXISTS customer_address_pkey;
ALTER TABLE IF EXISTS ONLY public.customer_account DROP CONSTRAINT IF EXISTS customer_account_pkey;
ALTER TABLE IF EXISTS ONLY public.customer_account_holder DROP CONSTRAINT IF EXISTS customer_account_holder_pkey;
ALTER TABLE IF EXISTS ONLY public.currency DROP CONSTRAINT IF EXISTS currency_pkey;
ALTER TABLE IF EXISTS ONLY public.credit_line DROP CONSTRAINT IF EXISTS credit_line_pkey;
ALTER TABLE IF EXISTS ONLY public.composer DROP CONSTRAINT IF EXISTS composer_pkey;
ALTER TABLE IF EXISTS ONLY public.composer_bank_account DROP CONSTRAINT IF EXISTS composer_bank_account_pkey;
ALTER TABLE IF EXISTS ONLY public.cart_shipping_method_tax_line DROP CONSTRAINT IF EXISTS cart_shipping_method_tax_line_pkey;
ALTER TABLE IF EXISTS ONLY public.cart_shipping_method DROP CONSTRAINT IF EXISTS cart_shipping_method_pkey;
ALTER TABLE IF EXISTS ONLY public.cart_shipping_method_adjustment DROP CONSTRAINT IF EXISTS cart_shipping_method_adjustment_pkey;
ALTER TABLE IF EXISTS ONLY public.cart_promotion DROP CONSTRAINT IF EXISTS cart_promotion_pkey;
ALTER TABLE IF EXISTS ONLY public.cart DROP CONSTRAINT IF EXISTS cart_pkey;
ALTER TABLE IF EXISTS ONLY public.cart_payment_collection DROP CONSTRAINT IF EXISTS cart_payment_collection_pkey;
ALTER TABLE IF EXISTS ONLY public.cart_line_item_tax_line DROP CONSTRAINT IF EXISTS cart_line_item_tax_line_pkey;
ALTER TABLE IF EXISTS ONLY public.cart_line_item DROP CONSTRAINT IF EXISTS cart_line_item_pkey;
ALTER TABLE IF EXISTS ONLY public.cart_line_item_adjustment DROP CONSTRAINT IF EXISTS cart_line_item_adjustment_pkey;
ALTER TABLE IF EXISTS ONLY public.cart_address DROP CONSTRAINT IF EXISTS cart_address_pkey;
ALTER TABLE IF EXISTS ONLY public.capture DROP CONSTRAINT IF EXISTS capture_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_verification DROP CONSTRAINT IF EXISTS auth_verification_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_password_reset_token DROP CONSTRAINT IF EXISTS auth_password_reset_token_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_mfa_recovery_code DROP CONSTRAINT IF EXISTS auth_mfa_recovery_code_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_mfa_factor DROP CONSTRAINT IF EXISTS auth_mfa_factor_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_identity DROP CONSTRAINT IF EXISTS auth_identity_pkey;
ALTER TABLE IF EXISTS ONLY public.application_method_target_rules DROP CONSTRAINT IF EXISTS application_method_target_rules_pkey;
ALTER TABLE IF EXISTS ONLY public.application_method_buy_rules DROP CONSTRAINT IF EXISTS application_method_buy_rules_pkey;
ALTER TABLE IF EXISTS ONLY public.api_key DROP CONSTRAINT IF EXISTS api_key_pkey;
ALTER TABLE IF EXISTS ONLY public.admin_user DROP CONSTRAINT IF EXISTS admin_user_pkey;
ALTER TABLE IF EXISTS ONLY public.admin_user DROP CONSTRAINT IF EXISTS admin_user_email_key;
ALTER TABLE IF EXISTS ONLY public.account_holder DROP CONSTRAINT IF EXISTS account_holder_pkey;
ALTER TABLE IF EXISTS public.script_migrations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.return ALTER COLUMN display_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.password_reset_otp ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.order_exchange ALTER COLUMN display_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.order_claim ALTER COLUMN display_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.order_change_action ALTER COLUMN ordering DROP DEFAULT;
ALTER TABLE IF EXISTS public."order" ALTER COLUMN display_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.mikro_orm_migrations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.link_module_migrations ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.workflow_execution;
DROP TABLE IF EXISTS public.view_configuration;
DROP TABLE IF EXISTS public.user_rbac_role;
DROP TABLE IF EXISTS public.user_preference;
DROP TABLE IF EXISTS public."user";
DROP TABLE IF EXISTS public.tax_region;
DROP TABLE IF EXISTS public.tax_rate_rule;
DROP TABLE IF EXISTS public.tax_rate;
DROP TABLE IF EXISTS public.tax_provider;
DROP TABLE IF EXISTS public.store_locale;
DROP TABLE IF EXISTS public.store_currency;
DROP TABLE IF EXISTS public.store;
DROP TABLE IF EXISTS public.stock_location_address;
DROP TABLE IF EXISTS public.stock_location;
DROP TABLE IF EXISTS public.shipping_profile;
DROP TABLE IF EXISTS public.shipping_option_type;
DROP TABLE IF EXISTS public.shipping_option_rule;
DROP TABLE IF EXISTS public.shipping_option_price_set;
DROP TABLE IF EXISTS public.shipping_option;
DROP TABLE IF EXISTS public.service_zone;
DROP SEQUENCE IF EXISTS public.script_migrations_id_seq;
DROP TABLE IF EXISTS public.script_migrations;
DROP TABLE IF EXISTS public.score;
DROP TABLE IF EXISTS public.sales_channel_stock_location;
DROP TABLE IF EXISTS public.sales_channel;
DROP TABLE IF EXISTS public.return_reason;
DROP TABLE IF EXISTS public.return_item;
DROP TABLE IF EXISTS public.return_fulfillment;
DROP SEQUENCE IF EXISTS public.return_display_id_seq;
DROP TABLE IF EXISTS public.return;
DROP TABLE IF EXISTS public.reservation_item;
DROP TABLE IF EXISTS public.region_payment_provider;
DROP TABLE IF EXISTS public.region_country;
DROP TABLE IF EXISTS public.region;
DROP TABLE IF EXISTS public.refund_reason;
DROP TABLE IF EXISTS public.refund;
DROP TABLE IF EXISTS public.publishable_api_key_sales_channel;
DROP TABLE IF EXISTS public.provider_identity;
DROP TABLE IF EXISTS public.property_label;
DROP TABLE IF EXISTS public.promotion_rule_value;
DROP TABLE IF EXISTS public.promotion_rule;
DROP TABLE IF EXISTS public.promotion_promotion_rule;
DROP TABLE IF EXISTS public.promotion_campaign_budget_usage;
DROP TABLE IF EXISTS public.promotion_campaign_budget;
DROP TABLE IF EXISTS public.promotion_campaign;
DROP TABLE IF EXISTS public.promotion_application_method;
DROP TABLE IF EXISTS public.promotion;
DROP TABLE IF EXISTS public.product_variant_product_image;
DROP TABLE IF EXISTS public.product_variant_price_set;
DROP TABLE IF EXISTS public.product_variant_option;
DROP TABLE IF EXISTS public.product_variant_inventory_item;
DROP TABLE IF EXISTS public.product_variant;
DROP TABLE IF EXISTS public.product_type;
DROP TABLE IF EXISTS public.product_tags;
DROP TABLE IF EXISTS public.product_tag;
DROP TABLE IF EXISTS public.product_shipping_profile;
DROP TABLE IF EXISTS public.product_sales_channel;
DROP TABLE IF EXISTS public.product_product_option_value;
DROP TABLE IF EXISTS public.product_product_option;
DROP TABLE IF EXISTS public.product_option_value;
DROP TABLE IF EXISTS public.product_option;
DROP TABLE IF EXISTS public.product_collection;
DROP TABLE IF EXISTS public.product_category_product;
DROP TABLE IF EXISTS public.product_category;
DROP TABLE IF EXISTS public.product;
DROP TABLE IF EXISTS public.price_set;
DROP TABLE IF EXISTS public.price_rule;
DROP TABLE IF EXISTS public.price_preference;
DROP TABLE IF EXISTS public.price_list_rule;
DROP TABLE IF EXISTS public.price_list;
DROP TABLE IF EXISTS public.price;
DROP TABLE IF EXISTS public.platform_settings;
DROP TABLE IF EXISTS public.payout_item;
DROP TABLE IF EXISTS public.payout_batch;
DROP TABLE IF EXISTS public.payment_session;
DROP TABLE IF EXISTS public.payment_provider;
DROP TABLE IF EXISTS public.payment_collection_payment_providers;
DROP TABLE IF EXISTS public.payment_collection;
DROP TABLE IF EXISTS public.payment;
DROP SEQUENCE IF EXISTS public.password_reset_otp_id_seq;
DROP TABLE IF EXISTS public.password_reset_otp;
DROP TABLE IF EXISTS public.order_transaction;
DROP TABLE IF EXISTS public.order_summary;
DROP TABLE IF EXISTS public.order_shipping_method_tax_line;
DROP TABLE IF EXISTS public.order_shipping_method_adjustment;
DROP TABLE IF EXISTS public.order_shipping_method;
DROP TABLE IF EXISTS public.order_shipping;
DROP TABLE IF EXISTS public.order_promotion;
DROP TABLE IF EXISTS public.order_payment_collection;
DROP TABLE IF EXISTS public.order_line_item_tax_line;
DROP TABLE IF EXISTS public.order_line_item_adjustment;
DROP TABLE IF EXISTS public.order_line_item;
DROP TABLE IF EXISTS public.order_item;
DROP TABLE IF EXISTS public.order_fulfillment;
DROP TABLE IF EXISTS public.order_exchange_item;
DROP SEQUENCE IF EXISTS public.order_exchange_display_id_seq;
DROP TABLE IF EXISTS public.order_exchange;
DROP SEQUENCE IF EXISTS public.order_display_id_seq;
DROP TABLE IF EXISTS public.order_credit_line;
DROP TABLE IF EXISTS public.order_claim_item_image;
DROP TABLE IF EXISTS public.order_claim_item;
DROP SEQUENCE IF EXISTS public.order_claim_display_id_seq;
DROP TABLE IF EXISTS public.order_claim;
DROP SEQUENCE IF EXISTS public.order_change_action_ordering_seq;
DROP TABLE IF EXISTS public.order_change_action;
DROP TABLE IF EXISTS public.order_change;
DROP TABLE IF EXISTS public.order_cart;
DROP TABLE IF EXISTS public.order_address;
DROP TABLE IF EXISTS public."order";
DROP TABLE IF EXISTS public.notification_provider;
DROP TABLE IF EXISTS public.notification;
DROP SEQUENCE IF EXISTS public.mikro_orm_migrations_id_seq;
DROP TABLE IF EXISTS public.mikro_orm_migrations;
DROP TABLE IF EXISTS public.location_fulfillment_set;
DROP TABLE IF EXISTS public.location_fulfillment_provider;
DROP SEQUENCE IF EXISTS public.link_module_migrations_id_seq;
DROP TABLE IF EXISTS public.link_module_migrations;
DROP TABLE IF EXISTS public.layout_configuration;
DROP TABLE IF EXISTS public.invite_rbac_role;
DROP TABLE IF EXISTS public.invite;
DROP TABLE IF EXISTS public.inventory_level;
DROP TABLE IF EXISTS public.inventory_item;
DROP TABLE IF EXISTS public.image;
DROP TABLE IF EXISTS public.hero_content;
DROP TABLE IF EXISTS public.geo_zone;
DROP TABLE IF EXISTS public.fulfillment_set;
DROP TABLE IF EXISTS public.fulfillment_provider;
DROP TABLE IF EXISTS public.fulfillment_label;
DROP TABLE IF EXISTS public.fulfillment_item;
DROP TABLE IF EXISTS public.fulfillment_address;
DROP TABLE IF EXISTS public.fulfillment;
DROP TABLE IF EXISTS public.customer_group_customer;
DROP TABLE IF EXISTS public.customer_group;
DROP TABLE IF EXISTS public.customer_download;
DROP TABLE IF EXISTS public.customer_address;
DROP TABLE IF EXISTS public.customer_account_holder;
DROP TABLE IF EXISTS public.customer_account;
DROP TABLE IF EXISTS public.customer;
DROP TABLE IF EXISTS public.currency;
DROP TABLE IF EXISTS public.credit_line;
DROP TABLE IF EXISTS public.composer_bank_account;
DROP TABLE IF EXISTS public.composer;
DROP TABLE IF EXISTS public.cart_shipping_method_tax_line;
DROP TABLE IF EXISTS public.cart_shipping_method_adjustment;
DROP TABLE IF EXISTS public.cart_shipping_method;
DROP TABLE IF EXISTS public.cart_promotion;
DROP TABLE IF EXISTS public.cart_payment_collection;
DROP TABLE IF EXISTS public.cart_line_item_tax_line;
DROP TABLE IF EXISTS public.cart_line_item_adjustment;
DROP TABLE IF EXISTS public.cart_line_item;
DROP TABLE IF EXISTS public.cart_address;
DROP TABLE IF EXISTS public.cart;
DROP TABLE IF EXISTS public.capture;
DROP TABLE IF EXISTS public.auth_verification;
DROP TABLE IF EXISTS public.auth_password_reset_token;
DROP TABLE IF EXISTS public.auth_mfa_recovery_code;
DROP TABLE IF EXISTS public.auth_mfa_factor;
DROP TABLE IF EXISTS public.auth_identity;
DROP TABLE IF EXISTS public.application_method_target_rules;
DROP TABLE IF EXISTS public.application_method_buy_rules;
DROP TABLE IF EXISTS public.api_key;
DROP TABLE IF EXISTS public.admin_user;
DROP TABLE IF EXISTS public.account_holder;
DROP TYPE IF EXISTS public.return_status_enum;
DROP TYPE IF EXISTS public.order_status_enum;
DROP TYPE IF EXISTS public.order_claim_type_enum;
DROP TYPE IF EXISTS public.claim_reason_enum;
--
-- Name: claim_reason_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.claim_reason_enum AS ENUM (
    'missing_item',
    'wrong_item',
    'production_failure',
    'other'
);


--
-- Name: order_claim_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.order_claim_type_enum AS ENUM (
    'refund',
    'replace'
);


--
-- Name: order_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.order_status_enum AS ENUM (
    'pending',
    'completed',
    'draft',
    'archived',
    'canceled',
    'requires_action'
);


--
-- Name: return_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.return_status_enum AS ENUM (
    'open',
    'requested',
    'received',
    'partially_received',
    'canceled'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account_holder; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account_holder (
    id text NOT NULL,
    provider_id text NOT NULL,
    external_id text NOT NULL,
    email text,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: admin_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_user (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    role_id text NOT NULL,
    role_name text NOT NULL,
    role_badge_color text NOT NULL,
    role_icon text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    last_login text DEFAULT 'Nunca'::text NOT NULL,
    permissions jsonb DEFAULT '[]'::jsonb NOT NULL,
    avatar_bg text DEFAULT 'bg-[#0071BC]'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    activation_token text,
    password_hash text
);


--
-- Name: api_key; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_key (
    id text NOT NULL,
    token text NOT NULL,
    salt text NOT NULL,
    redacted text NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    last_used_at timestamp with time zone,
    created_by text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_by text,
    revoked_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT api_key_type_check CHECK ((type = ANY (ARRAY['publishable'::text, 'secret'::text])))
);


--
-- Name: application_method_buy_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.application_method_buy_rules (
    application_method_id text NOT NULL,
    promotion_rule_id text NOT NULL
);


--
-- Name: application_method_target_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.application_method_target_rules (
    application_method_id text NOT NULL,
    promotion_rule_id text NOT NULL
);


--
-- Name: auth_identity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_identity (
    id text NOT NULL,
    app_metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: auth_mfa_factor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_mfa_factor (
    id text NOT NULL,
    auth_identity_id text NOT NULL,
    provider text NOT NULL,
    status text NOT NULL,
    provider_metadata jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: auth_mfa_recovery_code; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_mfa_recovery_code (
    id text NOT NULL,
    auth_identity_id text NOT NULL,
    code_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: auth_password_reset_token; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_password_reset_token (
    id text NOT NULL,
    auth_identity_id text NOT NULL,
    provider_identity_id text NOT NULL,
    entity_id text NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: auth_verification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_verification (
    id text NOT NULL,
    auth_identity_id text NOT NULL,
    entity_id text NOT NULL,
    entity_type text NOT NULL,
    code_provider text NOT NULL,
    verified_at timestamp with time zone,
    requested_at timestamp with time zone NOT NULL,
    provider_metadata jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: capture; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.capture (
    id text NOT NULL,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    payment_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    created_by text,
    metadata jsonb
);


--
-- Name: cart; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart (
    id text NOT NULL,
    region_id text,
    customer_id text,
    sales_channel_id text,
    email text,
    currency_code text NOT NULL,
    shipping_address_id text,
    billing_address_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    completed_at timestamp with time zone,
    locale text
);


--
-- Name: cart_address; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_address (
    id text NOT NULL,
    customer_id text,
    company text,
    first_name text,
    last_name text,
    address_1 text,
    address_2 text,
    city text,
    country_code text,
    province text,
    postal_code text,
    phone text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: cart_line_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_line_item (
    id text NOT NULL,
    cart_id text NOT NULL,
    title text NOT NULL,
    subtitle text,
    thumbnail text,
    quantity integer NOT NULL,
    variant_id text,
    product_id text,
    product_title text,
    product_description text,
    product_subtitle text,
    product_type text,
    product_collection text,
    product_handle text,
    variant_sku text,
    variant_barcode text,
    variant_title text,
    variant_option_values jsonb,
    requires_shipping boolean DEFAULT true NOT NULL,
    is_discountable boolean DEFAULT true NOT NULL,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    compare_at_unit_price numeric,
    raw_compare_at_unit_price jsonb,
    unit_price numeric NOT NULL,
    raw_unit_price jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    product_type_id text,
    is_custom_price boolean DEFAULT false NOT NULL,
    is_giftcard boolean DEFAULT false NOT NULL,
    CONSTRAINT cart_line_item_unit_price_check CHECK ((unit_price >= (0)::numeric))
);


--
-- Name: cart_line_item_adjustment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_line_item_adjustment (
    id text NOT NULL,
    description text,
    promotion_id text,
    code text,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    provider_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    item_id text,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    CONSTRAINT cart_line_item_adjustment_check CHECK ((amount >= (0)::numeric))
);


--
-- Name: cart_line_item_tax_line; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_line_item_tax_line (
    id text NOT NULL,
    description text,
    tax_rate_id text,
    code text NOT NULL,
    rate real NOT NULL,
    provider_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    item_id text,
    data jsonb
);


--
-- Name: cart_payment_collection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_payment_collection (
    cart_id character varying(255) NOT NULL,
    payment_collection_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: cart_promotion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_promotion (
    cart_id character varying(255) NOT NULL,
    promotion_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: cart_shipping_method; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_shipping_method (
    id text NOT NULL,
    cart_id text NOT NULL,
    name text NOT NULL,
    description jsonb,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    shipping_option_id text,
    data jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT cart_shipping_method_check CHECK ((amount >= (0)::numeric))
);


--
-- Name: cart_shipping_method_adjustment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_shipping_method_adjustment (
    id text NOT NULL,
    description text,
    promotion_id text,
    code text,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    provider_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    shipping_method_id text
);


--
-- Name: cart_shipping_method_tax_line; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_shipping_method_tax_line (
    id text NOT NULL,
    description text,
    tax_rate_id text,
    code text NOT NULL,
    rate real NOT NULL,
    provider_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    shipping_method_id text,
    data jsonb
);


--
-- Name: composer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.composer (
    id text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    artistic_name text,
    slug text NOT NULL,
    bio_es text,
    bio_en text,
    region text,
    era text,
    photo_url text,
    status text DEFAULT 'PENDING_APPROVAL'::text NOT NULL,
    rejection_reason text,
    user_id text,
    email text NOT NULL,
    phone text,
    is_featured boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    commission_percentage numeric(5,2),
    password_hash text,
    salt text,
    approval_attempts integer DEFAULT 1 NOT NULL,
    CONSTRAINT composer_status_check CHECK ((status = ANY (ARRAY['PENDING_APPROVAL'::text, 'APPROVED'::text, 'REJECTED'::text, 'SUSPENDED'::text, 'BLOCKED'::text])))
);


--
-- Name: composer_bank_account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.composer_bank_account (
    id text NOT NULL,
    account_type text DEFAULT 'AHORROS'::text NOT NULL,
    bank_code text,
    bank_name text NOT NULL,
    account_number text NOT NULL,
    holder_name text NOT NULL,
    document_type text DEFAULT 'CC'::text NOT NULL,
    document_number text NOT NULL,
    composer_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT composer_bank_account_account_type_check CHECK ((account_type = ANY (ARRAY['AHORROS'::text, 'CORRIENTE'::text, 'NEQUI'::text, 'DAVIPLATA'::text])))
);


--
-- Name: credit_line; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credit_line (
    id text NOT NULL,
    cart_id text NOT NULL,
    reference text,
    reference_id text,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: currency; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.currency (
    code text NOT NULL,
    symbol text NOT NULL,
    symbol_native text NOT NULL,
    decimal_digits integer DEFAULT 0 NOT NULL,
    rounding numeric DEFAULT 0 NOT NULL,
    raw_rounding jsonb NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: customer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer (
    id text NOT NULL,
    company_name text,
    first_name text,
    last_name text,
    email text,
    phone text,
    has_account boolean DEFAULT false NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    created_by text
);


--
-- Name: customer_account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_account (
    id text NOT NULL,
    email text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    password_hash text NOT NULL,
    salt text NOT NULL,
    phone text,
    tax_id text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: customer_account_holder; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_account_holder (
    customer_id character varying(255) NOT NULL,
    account_holder_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: customer_address; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_address (
    id text NOT NULL,
    customer_id text NOT NULL,
    address_name text,
    is_default_shipping boolean DEFAULT false NOT NULL,
    is_default_billing boolean DEFAULT false NOT NULL,
    company text,
    first_name text,
    last_name text,
    address_1 text,
    address_2 text,
    city text,
    country_code text,
    province text,
    postal_code text,
    phone text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: customer_download; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_download (
    id text NOT NULL,
    order_id text NOT NULL,
    customer_id text NOT NULL,
    score_id text NOT NULL,
    score_title text NOT NULL,
    composer_name text NOT NULL,
    download_token text NOT NULL,
    download_count integer DEFAULT 0 NOT NULL,
    max_downloads integer DEFAULT 5 NOT NULL,
    watermark_text text,
    watermarked_file_url text,
    wompi_transaction_id text,
    buyer_name text NOT NULL,
    buyer_email text NOT NULL,
    buyer_tax_id text,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: customer_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_group (
    id text NOT NULL,
    name text NOT NULL,
    metadata jsonb,
    created_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: customer_group_customer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_group_customer (
    id text NOT NULL,
    customer_id text NOT NULL,
    customer_group_id text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    deleted_at timestamp with time zone
);


--
-- Name: fulfillment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fulfillment (
    id text NOT NULL,
    location_id text NOT NULL,
    packed_at timestamp with time zone,
    shipped_at timestamp with time zone,
    delivered_at timestamp with time zone,
    canceled_at timestamp with time zone,
    data jsonb,
    provider_id text,
    shipping_option_id text,
    metadata jsonb,
    delivery_address_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    marked_shipped_by text,
    created_by text,
    requires_shipping boolean DEFAULT true NOT NULL
);


--
-- Name: fulfillment_address; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fulfillment_address (
    id text NOT NULL,
    company text,
    first_name text,
    last_name text,
    address_1 text,
    address_2 text,
    city text,
    country_code text,
    province text,
    postal_code text,
    phone text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: fulfillment_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fulfillment_item (
    id text NOT NULL,
    title text NOT NULL,
    sku text NOT NULL,
    barcode text NOT NULL,
    quantity numeric NOT NULL,
    raw_quantity jsonb NOT NULL,
    line_item_id text,
    inventory_item_id text,
    fulfillment_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: fulfillment_label; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fulfillment_label (
    id text NOT NULL,
    tracking_number text NOT NULL,
    tracking_url text NOT NULL,
    label_url text NOT NULL,
    fulfillment_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: fulfillment_provider; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fulfillment_provider (
    id text NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: fulfillment_set; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fulfillment_set (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: geo_zone; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.geo_zone (
    id text NOT NULL,
    type text DEFAULT 'country'::text NOT NULL,
    country_code text NOT NULL,
    province_code text,
    city text,
    service_zone_id text NOT NULL,
    postal_expression jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT geo_zone_type_check CHECK ((type = ANY (ARRAY['country'::text, 'province'::text, 'city'::text, 'zip'::text])))
);


--
-- Name: hero_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hero_content (
    id text NOT NULL,
    title_part1 text DEFAULT 'EL ARCHIVO DIGITAL DEL'::text NOT NULL,
    title_part2_highlight text DEFAULT 'PIANO COLOMBIANO'::text NOT NULL,
    description text DEFAULT 'Colección exclusiva de partituras urtext, transcripciones y obras contemporáneas con protección anticopia y regalías directas a los maestros autores.'::text NOT NULL,
    button1_text text DEFAULT 'Explorar Catálogo'::text NOT NULL,
    button1_url text DEFAULT '/tienda'::text NOT NULL,
    button2_text text DEFAULT 'Portal Compositores'::text NOT NULL,
    button2_url text DEFAULT '/compositor/registro'::text NOT NULL,
    urtext_badge_text text DEFAULT 'EDICIÓN CRÍTICA & URTEXT COLOMBIANA'::text NOT NULL,
    featured_score_slug text DEFAULT 'score_1'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    featured_genre text,
    featured_title text,
    featured_author text,
    featured_tempo text,
    featured_ismn text,
    featured_audio_sample text,
    featured_audio_url text,
    featured_badge_text text,
    featured_link_url text
);


--
-- Name: image; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image (
    id text NOT NULL,
    url text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    rank integer DEFAULT 0 NOT NULL,
    product_id text NOT NULL
);


--
-- Name: inventory_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_item (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    sku text,
    origin_country text,
    hs_code text,
    mid_code text,
    material text,
    weight integer,
    length integer,
    height integer,
    width integer,
    requires_shipping boolean DEFAULT true NOT NULL,
    description text,
    title text,
    thumbnail text,
    metadata jsonb
);


--
-- Name: inventory_level; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_level (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    inventory_item_id text NOT NULL,
    location_id text NOT NULL,
    stocked_quantity numeric DEFAULT 0 NOT NULL,
    reserved_quantity numeric DEFAULT 0 NOT NULL,
    incoming_quantity numeric DEFAULT 0 NOT NULL,
    metadata jsonb,
    raw_stocked_quantity jsonb,
    raw_reserved_quantity jsonb,
    raw_incoming_quantity jsonb
);


--
-- Name: invite; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invite (
    id text NOT NULL,
    email text NOT NULL,
    accepted boolean DEFAULT false NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: invite_rbac_role; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invite_rbac_role (
    invite_id character varying(255) NOT NULL,
    rbac_role_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: layout_configuration; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.layout_configuration (
    id text NOT NULL,
    zone text NOT NULL,
    user_id text,
    is_system_default boolean DEFAULT false NOT NULL,
    configuration jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: link_module_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.link_module_migrations (
    id integer NOT NULL,
    table_name character varying(255) NOT NULL,
    link_descriptor jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: link_module_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.link_module_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: link_module_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.link_module_migrations_id_seq OWNED BY public.link_module_migrations.id;


--
-- Name: location_fulfillment_provider; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.location_fulfillment_provider (
    stock_location_id character varying(255) NOT NULL,
    fulfillment_provider_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: location_fulfillment_set; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.location_fulfillment_set (
    stock_location_id character varying(255) NOT NULL,
    fulfillment_set_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: mikro_orm_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mikro_orm_migrations (
    id integer NOT NULL,
    name character varying(255),
    executed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: mikro_orm_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mikro_orm_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mikro_orm_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mikro_orm_migrations_id_seq OWNED BY public.mikro_orm_migrations.id;


--
-- Name: notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification (
    id text NOT NULL,
    "to" text NOT NULL,
    channel text NOT NULL,
    template text,
    data jsonb,
    trigger_type text,
    resource_id text,
    resource_type text,
    receiver_id text,
    original_notification_id text,
    idempotency_key text,
    external_id text,
    provider_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    status text DEFAULT 'pending'::text NOT NULL,
    "from" text,
    provider_data jsonb,
    CONSTRAINT notification_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'success'::text, 'failure'::text])))
);


--
-- Name: notification_provider; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_provider (
    id text NOT NULL,
    handle text NOT NULL,
    name text NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    channels text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."order" (
    id text NOT NULL,
    region_id text,
    display_id integer,
    customer_id text,
    version integer DEFAULT 1 NOT NULL,
    sales_channel_id text,
    status public.order_status_enum DEFAULT 'pending'::public.order_status_enum NOT NULL,
    is_draft_order boolean DEFAULT false NOT NULL,
    email text,
    currency_code text NOT NULL,
    shipping_address_id text,
    billing_address_id text,
    no_notification boolean,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    canceled_at timestamp with time zone,
    custom_display_id text,
    locale text
);


--
-- Name: order_address; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_address (
    id text NOT NULL,
    customer_id text,
    company text,
    first_name text,
    last_name text,
    address_1 text,
    address_2 text,
    city text,
    country_code text,
    province text,
    postal_code text,
    phone text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: order_cart; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_cart (
    order_id character varying(255) NOT NULL,
    cart_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: order_change; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_change (
    id text NOT NULL,
    order_id text NOT NULL,
    version integer NOT NULL,
    description text,
    status text DEFAULT 'pending'::text NOT NULL,
    internal_note text,
    created_by text,
    requested_by text,
    requested_at timestamp with time zone,
    confirmed_by text,
    confirmed_at timestamp with time zone,
    declined_by text,
    declined_reason text,
    metadata jsonb,
    declined_at timestamp with time zone,
    canceled_by text,
    canceled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    change_type text,
    deleted_at timestamp with time zone,
    return_id text,
    claim_id text,
    exchange_id text,
    carry_over_promotions boolean,
    CONSTRAINT order_change_status_check CHECK ((status = ANY (ARRAY['confirmed'::text, 'declined'::text, 'requested'::text, 'pending'::text, 'canceled'::text])))
);


--
-- Name: order_change_action; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_change_action (
    id text NOT NULL,
    order_id text,
    version integer,
    ordering bigint NOT NULL,
    order_change_id text,
    reference text,
    reference_id text,
    action text NOT NULL,
    details jsonb,
    amount numeric,
    raw_amount jsonb,
    internal_note text,
    applied boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    return_id text,
    claim_id text,
    exchange_id text
);


--
-- Name: order_change_action_ordering_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_change_action_ordering_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_change_action_ordering_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_change_action_ordering_seq OWNED BY public.order_change_action.ordering;


--
-- Name: order_claim; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_claim (
    id text NOT NULL,
    order_id text NOT NULL,
    return_id text,
    order_version integer NOT NULL,
    display_id integer NOT NULL,
    type public.order_claim_type_enum NOT NULL,
    no_notification boolean,
    refund_amount numeric,
    raw_refund_amount jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    canceled_at timestamp with time zone,
    created_by text
);


--
-- Name: order_claim_display_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_claim_display_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_claim_display_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_claim_display_id_seq OWNED BY public.order_claim.display_id;


--
-- Name: order_claim_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_claim_item (
    id text NOT NULL,
    claim_id text NOT NULL,
    item_id text NOT NULL,
    is_additional_item boolean DEFAULT false NOT NULL,
    reason public.claim_reason_enum,
    quantity numeric NOT NULL,
    raw_quantity jsonb NOT NULL,
    note text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: order_claim_item_image; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_claim_item_image (
    id text NOT NULL,
    claim_item_id text NOT NULL,
    url text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: order_credit_line; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_credit_line (
    id text NOT NULL,
    order_id text NOT NULL,
    reference text,
    reference_id text,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    version integer DEFAULT 1 NOT NULL
);


--
-- Name: order_display_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_display_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_display_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_display_id_seq OWNED BY public."order".display_id;


--
-- Name: order_exchange; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_exchange (
    id text NOT NULL,
    order_id text NOT NULL,
    return_id text,
    order_version integer NOT NULL,
    display_id integer NOT NULL,
    no_notification boolean,
    allow_backorder boolean DEFAULT false NOT NULL,
    difference_due numeric,
    raw_difference_due jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    canceled_at timestamp with time zone,
    created_by text
);


--
-- Name: order_exchange_display_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_exchange_display_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_exchange_display_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_exchange_display_id_seq OWNED BY public.order_exchange.display_id;


--
-- Name: order_exchange_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_exchange_item (
    id text NOT NULL,
    exchange_id text NOT NULL,
    item_id text NOT NULL,
    quantity numeric NOT NULL,
    raw_quantity jsonb NOT NULL,
    note text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: order_fulfillment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_fulfillment (
    order_id character varying(255) NOT NULL,
    fulfillment_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: order_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_item (
    id text NOT NULL,
    order_id text NOT NULL,
    version integer NOT NULL,
    item_id text NOT NULL,
    quantity numeric NOT NULL,
    raw_quantity jsonb NOT NULL,
    fulfilled_quantity numeric NOT NULL,
    raw_fulfilled_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL,
    shipped_quantity numeric NOT NULL,
    raw_shipped_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL,
    return_requested_quantity numeric NOT NULL,
    raw_return_requested_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL,
    return_received_quantity numeric NOT NULL,
    raw_return_received_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL,
    return_dismissed_quantity numeric NOT NULL,
    raw_return_dismissed_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL,
    written_off_quantity numeric NOT NULL,
    raw_written_off_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    delivered_quantity numeric DEFAULT 0 NOT NULL,
    raw_delivered_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL,
    unit_price numeric,
    raw_unit_price jsonb,
    compare_at_unit_price numeric,
    raw_compare_at_unit_price jsonb
);


--
-- Name: order_line_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_line_item (
    id text NOT NULL,
    totals_id text,
    title text NOT NULL,
    subtitle text,
    thumbnail text,
    variant_id text,
    product_id text,
    product_title text,
    product_description text,
    product_subtitle text,
    product_type text,
    product_collection text,
    product_handle text,
    variant_sku text,
    variant_barcode text,
    variant_title text,
    variant_option_values jsonb,
    requires_shipping boolean DEFAULT true NOT NULL,
    is_discountable boolean DEFAULT true NOT NULL,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    compare_at_unit_price numeric,
    raw_compare_at_unit_price jsonb,
    unit_price numeric NOT NULL,
    raw_unit_price jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    is_custom_price boolean DEFAULT false NOT NULL,
    product_type_id text,
    is_giftcard boolean DEFAULT false NOT NULL
);


--
-- Name: order_line_item_adjustment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_line_item_adjustment (
    id text NOT NULL,
    description text,
    promotion_id text,
    code text,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    provider_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    item_id text NOT NULL,
    deleted_at timestamp with time zone,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    version integer DEFAULT 1 NOT NULL
);


--
-- Name: order_line_item_tax_line; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_line_item_tax_line (
    id text NOT NULL,
    description text,
    tax_rate_id text,
    code text NOT NULL,
    rate numeric NOT NULL,
    raw_rate jsonb NOT NULL,
    provider_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    item_id text NOT NULL,
    deleted_at timestamp with time zone,
    metadata jsonb,
    data jsonb
);


--
-- Name: order_payment_collection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_payment_collection (
    order_id character varying(255) NOT NULL,
    payment_collection_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: order_promotion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_promotion (
    order_id character varying(255) NOT NULL,
    promotion_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: order_shipping; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_shipping (
    id text NOT NULL,
    order_id text NOT NULL,
    version integer NOT NULL,
    shipping_method_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    return_id text,
    claim_id text,
    exchange_id text
);


--
-- Name: order_shipping_method; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_shipping_method (
    id text NOT NULL,
    name text NOT NULL,
    description jsonb,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    shipping_option_id text,
    data jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    is_custom_amount boolean DEFAULT false NOT NULL
);


--
-- Name: order_shipping_method_adjustment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_shipping_method_adjustment (
    id text NOT NULL,
    description text,
    promotion_id text,
    code text,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    provider_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    shipping_method_id text NOT NULL,
    deleted_at timestamp with time zone,
    version integer DEFAULT 1 NOT NULL
);


--
-- Name: order_shipping_method_tax_line; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_shipping_method_tax_line (
    id text NOT NULL,
    description text,
    tax_rate_id text,
    code text NOT NULL,
    rate numeric NOT NULL,
    raw_rate jsonb NOT NULL,
    provider_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    shipping_method_id text NOT NULL,
    deleted_at timestamp with time zone,
    metadata jsonb,
    data jsonb
);


--
-- Name: order_summary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_summary (
    id text NOT NULL,
    order_id text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    totals jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: order_transaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_transaction (
    id text NOT NULL,
    order_id text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    currency_code text NOT NULL,
    reference text,
    reference_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    return_id text,
    claim_id text,
    exchange_id text
);


--
-- Name: password_reset_otp; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_otp (
    id integer NOT NULL,
    email text NOT NULL,
    code text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    attempts integer DEFAULT 0 NOT NULL
);


--
-- Name: password_reset_otp_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.password_reset_otp_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: password_reset_otp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.password_reset_otp_id_seq OWNED BY public.password_reset_otp.id;


--
-- Name: payment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment (
    id text NOT NULL,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    currency_code text NOT NULL,
    provider_id text NOT NULL,
    data jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    captured_at timestamp with time zone,
    canceled_at timestamp with time zone,
    payment_collection_id text NOT NULL,
    payment_session_id text NOT NULL,
    metadata jsonb
);


--
-- Name: payment_collection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_collection (
    id text NOT NULL,
    currency_code text NOT NULL,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    authorized_amount numeric,
    raw_authorized_amount jsonb,
    captured_amount numeric,
    raw_captured_amount jsonb,
    refunded_amount numeric,
    raw_refunded_amount jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    completed_at timestamp with time zone,
    status text DEFAULT 'not_paid'::text NOT NULL,
    metadata jsonb,
    CONSTRAINT payment_collection_status_check CHECK ((status = ANY (ARRAY['not_paid'::text, 'awaiting'::text, 'authorized'::text, 'partially_authorized'::text, 'canceled'::text, 'failed'::text, 'partially_captured'::text, 'completed'::text])))
);


--
-- Name: payment_collection_payment_providers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_collection_payment_providers (
    payment_collection_id text NOT NULL,
    payment_provider_id text NOT NULL
);


--
-- Name: payment_provider; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_provider (
    id text NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: payment_session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_session (
    id text NOT NULL,
    currency_code text NOT NULL,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    provider_id text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    context jsonb,
    status text DEFAULT 'pending'::text NOT NULL,
    authorized_at timestamp with time zone,
    payment_collection_id text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT payment_session_status_check CHECK ((status = ANY (ARRAY['authorized'::text, 'captured'::text, 'pending'::text, 'requires_more'::text, 'error'::text, 'canceled'::text, 'pending_authorization'::text])))
);


--
-- Name: payout_batch; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payout_batch (
    id text NOT NULL,
    batch_number text NOT NULL,
    period_start timestamp with time zone NOT NULL,
    period_end timestamp with time zone NOT NULL,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    total_gross_cop integer DEFAULT 0 NOT NULL,
    total_commission_pc_cop integer DEFAULT 0 NOT NULL,
    total_net_composers_cop integer DEFAULT 0 NOT NULL,
    wompi_batch_id text,
    executed_at timestamp with time zone,
    executed_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT payout_batch_status_check CHECK ((status = ANY (ARRAY['DRAFT'::text, 'PROCESSING'::text, 'COMPLETED'::text, 'FAILED'::text])))
);


--
-- Name: payout_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payout_item (
    id text NOT NULL,
    composer_id text NOT NULL,
    composer_name text NOT NULL,
    bank_name text NOT NULL,
    account_type text NOT NULL,
    account_number text NOT NULL,
    document_number text NOT NULL,
    amount_gross_cop integer DEFAULT 0 NOT NULL,
    commission_pc_cop integer DEFAULT 0 NOT NULL,
    amount_net_cop integer DEFAULT 0 NOT NULL,
    wompi_transfer_id text,
    status text DEFAULT 'PENDING'::text NOT NULL,
    error_message text,
    batch_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT payout_item_status_check CHECK ((status = ANY (ARRAY['PENDING'::text, 'PROCESSING'::text, 'TRANSFERRED'::text, 'FAILED'::text])))
);


--
-- Name: platform_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_settings (
    key character varying(100) NOT NULL,
    value text NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: price; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.price (
    id text NOT NULL,
    title text,
    price_set_id text NOT NULL,
    currency_code text NOT NULL,
    raw_amount jsonb NOT NULL,
    rules_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    price_list_id text,
    amount numeric NOT NULL,
    min_quantity numeric,
    max_quantity numeric,
    raw_min_quantity jsonb,
    raw_max_quantity jsonb
);


--
-- Name: price_list; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.price_list (
    id text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    rules_count integer DEFAULT 0,
    title text NOT NULL,
    description text NOT NULL,
    type text DEFAULT 'sale'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    metadata jsonb,
    CONSTRAINT price_list_status_check CHECK ((status = ANY (ARRAY['active'::text, 'draft'::text]))),
    CONSTRAINT price_list_type_check CHECK ((type = ANY (ARRAY['sale'::text, 'override'::text])))
);


--
-- Name: price_list_rule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.price_list_rule (
    id text NOT NULL,
    price_list_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    value jsonb,
    attribute text DEFAULT ''::text NOT NULL
);


--
-- Name: price_preference; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.price_preference (
    id text NOT NULL,
    attribute text NOT NULL,
    value text,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: price_rule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.price_rule (
    id text NOT NULL,
    value text NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    price_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    attribute text DEFAULT ''::text NOT NULL,
    operator text DEFAULT 'eq'::text NOT NULL,
    CONSTRAINT price_rule_operator_check CHECK ((operator = ANY (ARRAY['gte'::text, 'lte'::text, 'gt'::text, 'lt'::text, 'eq'::text])))
);


--
-- Name: price_set; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.price_set (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product (
    id text NOT NULL,
    title text NOT NULL,
    handle text NOT NULL,
    subtitle text,
    description text,
    is_giftcard boolean DEFAULT false NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    thumbnail text,
    weight real,
    length real,
    height real,
    width real,
    origin_country text,
    hs_code text,
    mid_code text,
    material text,
    collection_id text,
    type_id text,
    discountable boolean DEFAULT true NOT NULL,
    external_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    metadata jsonb,
    CONSTRAINT product_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'proposed'::text, 'published'::text, 'rejected'::text])))
);


--
-- Name: product_category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_category (
    id text NOT NULL,
    name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    handle text NOT NULL,
    mpath text NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    is_internal boolean DEFAULT false NOT NULL,
    rank integer DEFAULT 0 NOT NULL,
    parent_category_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    metadata jsonb,
    external_id text
);


--
-- Name: product_category_product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_category_product (
    product_id text NOT NULL,
    product_category_id text NOT NULL
);


--
-- Name: product_collection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_collection (
    id text NOT NULL,
    title text NOT NULL,
    handle text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    external_id text
);


--
-- Name: product_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_option (
    id text NOT NULL,
    title text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    is_exclusive boolean DEFAULT false NOT NULL
);


--
-- Name: product_option_value; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_option_value (
    id text NOT NULL,
    value text NOT NULL,
    option_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    rank integer
);


--
-- Name: product_product_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_product_option (
    id text NOT NULL,
    product_id text NOT NULL,
    product_option_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: product_product_option_value; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_product_option_value (
    id text NOT NULL,
    product_product_option_id text NOT NULL,
    product_option_value_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: product_sales_channel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_sales_channel (
    product_id character varying(255) NOT NULL,
    sales_channel_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: product_shipping_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_shipping_profile (
    product_id character varying(255) NOT NULL,
    shipping_profile_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: product_tag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_tag (
    id text NOT NULL,
    value text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    external_id text
);


--
-- Name: product_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_tags (
    product_id text NOT NULL,
    product_tag_id text NOT NULL
);


--
-- Name: product_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_type (
    id text NOT NULL,
    value text NOT NULL,
    metadata json,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    external_id text
);


--
-- Name: product_variant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_variant (
    id text NOT NULL,
    title text NOT NULL,
    sku text,
    barcode text,
    ean text,
    upc text,
    allow_backorder boolean DEFAULT false NOT NULL,
    manage_inventory boolean DEFAULT true NOT NULL,
    hs_code text,
    origin_country text,
    mid_code text,
    material text,
    weight real,
    length real,
    height real,
    width real,
    metadata jsonb,
    variant_rank integer DEFAULT 0,
    product_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    thumbnail text
);


--
-- Name: product_variant_inventory_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_variant_inventory_item (
    variant_id character varying(255) NOT NULL,
    inventory_item_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    required_quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: product_variant_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_variant_option (
    variant_id text NOT NULL,
    option_value_id text NOT NULL
);


--
-- Name: product_variant_price_set; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_variant_price_set (
    variant_id character varying(255) NOT NULL,
    price_set_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: product_variant_product_image; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_variant_product_image (
    id text NOT NULL,
    variant_id text NOT NULL,
    image_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: promotion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotion (
    id text NOT NULL,
    code text NOT NULL,
    campaign_id text,
    is_automatic boolean DEFAULT false NOT NULL,
    type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    status text DEFAULT 'draft'::text NOT NULL,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    "limit" integer,
    used integer DEFAULT 0 NOT NULL,
    metadata jsonb,
    CONSTRAINT promotion_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'inactive'::text]))),
    CONSTRAINT promotion_type_check CHECK ((type = ANY (ARRAY['standard'::text, 'buyget'::text])))
);


--
-- Name: promotion_application_method; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotion_application_method (
    id text NOT NULL,
    value numeric,
    raw_value jsonb,
    max_quantity integer,
    apply_to_quantity integer,
    buy_rules_min_quantity integer,
    type text NOT NULL,
    target_type text NOT NULL,
    allocation text,
    promotion_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    currency_code text,
    CONSTRAINT promotion_application_method_allocation_check CHECK ((allocation = ANY (ARRAY['each'::text, 'across'::text, 'once'::text]))),
    CONSTRAINT promotion_application_method_target_type_check CHECK ((target_type = ANY (ARRAY['order'::text, 'shipping_methods'::text, 'items'::text]))),
    CONSTRAINT promotion_application_method_type_check CHECK ((type = ANY (ARRAY['fixed'::text, 'percentage'::text])))
);


--
-- Name: promotion_campaign; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotion_campaign (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    campaign_identifier text NOT NULL,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: promotion_campaign_budget; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotion_campaign_budget (
    id text NOT NULL,
    type text NOT NULL,
    campaign_id text NOT NULL,
    "limit" numeric,
    raw_limit jsonb,
    used numeric DEFAULT 0 NOT NULL,
    raw_used jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    currency_code text,
    attribute text,
    CONSTRAINT promotion_campaign_budget_type_check CHECK ((type = ANY (ARRAY['spend'::text, 'usage'::text, 'use_by_attribute'::text, 'spend_by_attribute'::text])))
);


--
-- Name: promotion_campaign_budget_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotion_campaign_budget_usage (
    id text NOT NULL,
    attribute_value text NOT NULL,
    used numeric DEFAULT 0 NOT NULL,
    budget_id text NOT NULL,
    raw_used jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: promotion_promotion_rule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotion_promotion_rule (
    promotion_id text NOT NULL,
    promotion_rule_id text NOT NULL
);


--
-- Name: promotion_rule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotion_rule (
    id text NOT NULL,
    description text,
    attribute text NOT NULL,
    operator text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT promotion_rule_operator_check CHECK ((operator = ANY (ARRAY['gte'::text, 'lte'::text, 'gt'::text, 'lt'::text, 'eq'::text, 'ne'::text, 'in'::text])))
);


--
-- Name: promotion_rule_value; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotion_rule_value (
    id text NOT NULL,
    promotion_rule_id text NOT NULL,
    value text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: property_label; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.property_label (
    id text NOT NULL,
    entity text NOT NULL,
    property text NOT NULL,
    label text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: provider_identity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provider_identity (
    id text NOT NULL,
    entity_id text NOT NULL,
    provider text NOT NULL,
    auth_identity_id text NOT NULL,
    user_metadata jsonb,
    provider_metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: publishable_api_key_sales_channel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.publishable_api_key_sales_channel (
    publishable_key_id character varying(255) NOT NULL,
    sales_channel_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: refund; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refund (
    id text NOT NULL,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    payment_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    created_by text,
    metadata jsonb,
    refund_reason_id text,
    note text
);


--
-- Name: refund_reason; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refund_reason (
    id text NOT NULL,
    label text NOT NULL,
    description text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    code text NOT NULL
);


--
-- Name: region; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.region (
    id text NOT NULL,
    name text NOT NULL,
    currency_code text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    automatic_taxes boolean DEFAULT true NOT NULL
);


--
-- Name: region_country; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.region_country (
    iso_2 text NOT NULL,
    iso_3 text NOT NULL,
    num_code text NOT NULL,
    name text NOT NULL,
    display_name text NOT NULL,
    region_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: region_payment_provider; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.region_payment_provider (
    region_id character varying(255) NOT NULL,
    payment_provider_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: reservation_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reservation_item (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    line_item_id text,
    location_id text NOT NULL,
    quantity numeric NOT NULL,
    external_id text,
    description text,
    created_by text,
    metadata jsonb,
    inventory_item_id text NOT NULL,
    allow_backorder boolean DEFAULT false,
    raw_quantity jsonb
);


--
-- Name: return; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.return (
    id text NOT NULL,
    order_id text NOT NULL,
    claim_id text,
    exchange_id text,
    order_version integer NOT NULL,
    display_id integer NOT NULL,
    status public.return_status_enum DEFAULT 'open'::public.return_status_enum NOT NULL,
    no_notification boolean,
    refund_amount numeric,
    raw_refund_amount jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    received_at timestamp with time zone,
    canceled_at timestamp with time zone,
    location_id text,
    requested_at timestamp with time zone,
    created_by text
);


--
-- Name: return_display_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.return_display_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: return_display_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.return_display_id_seq OWNED BY public.return.display_id;


--
-- Name: return_fulfillment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.return_fulfillment (
    return_id character varying(255) NOT NULL,
    fulfillment_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: return_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.return_item (
    id text NOT NULL,
    return_id text NOT NULL,
    reason_id text,
    item_id text NOT NULL,
    quantity numeric NOT NULL,
    raw_quantity jsonb NOT NULL,
    received_quantity numeric DEFAULT 0 NOT NULL,
    raw_received_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL,
    note text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    damaged_quantity numeric DEFAULT 0 NOT NULL,
    raw_damaged_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL
);


--
-- Name: return_reason; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.return_reason (
    id character varying NOT NULL,
    value character varying NOT NULL,
    label character varying NOT NULL,
    description character varying,
    metadata jsonb,
    parent_return_reason_id character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: sales_channel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_channel (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    is_disabled boolean DEFAULT false NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: sales_channel_stock_location; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_channel_stock_location (
    sales_channel_id character varying(255) NOT NULL,
    stock_location_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: score; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.score (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    composer_id text NOT NULL,
    genre text DEFAULT 'PASILLO'::text NOT NULL,
    difficulty text DEFAULT 'INTERMEDIO'::text NOT NULL,
    description_es text,
    description_en text,
    pages_count integer DEFAULT 1 NOT NULL,
    duration_approx text,
    year_composition integer,
    tonality text,
    price_cop integer DEFAULT 0 NOT NULL,
    price_usd integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'IN_REVIEW'::text NOT NULL,
    rejection_notes text,
    original_pdf_url text,
    preview_pdf_url text,
    audio_sample_url text,
    is_featured boolean DEFAULT false NOT NULL,
    product_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    preview_images jsonb DEFAULT '[]'::jsonb,
    CONSTRAINT score_status_check CHECK ((status = ANY (ARRAY['DRAFT'::text, 'IN_REVIEW'::text, 'APPROVED'::text, 'REJECTED'::text])))
);


--
-- Name: script_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.script_migrations (
    id integer NOT NULL,
    script_name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    finished_at timestamp with time zone
);


--
-- Name: script_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.script_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: script_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.script_migrations_id_seq OWNED BY public.script_migrations.id;


--
-- Name: service_zone; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_zone (
    id text NOT NULL,
    name text NOT NULL,
    metadata jsonb,
    fulfillment_set_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: shipping_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_option (
    id text NOT NULL,
    name text NOT NULL,
    price_type text DEFAULT 'flat'::text NOT NULL,
    service_zone_id text NOT NULL,
    shipping_profile_id text,
    provider_id text,
    data jsonb,
    metadata jsonb,
    shipping_option_type_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT shipping_option_price_type_check CHECK ((price_type = ANY (ARRAY['calculated'::text, 'flat'::text])))
);


--
-- Name: shipping_option_price_set; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_option_price_set (
    shipping_option_id character varying(255) NOT NULL,
    price_set_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: shipping_option_rule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_option_rule (
    id text NOT NULL,
    attribute text NOT NULL,
    operator text NOT NULL,
    value jsonb,
    shipping_option_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT shipping_option_rule_operator_check CHECK ((operator = ANY (ARRAY['in'::text, 'eq'::text, 'ne'::text, 'gt'::text, 'gte'::text, 'lt'::text, 'lte'::text, 'nin'::text])))
);


--
-- Name: shipping_option_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_option_type (
    id text NOT NULL,
    label text NOT NULL,
    description text,
    code text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: shipping_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_profile (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: stock_location; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_location (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    name text NOT NULL,
    address_id text,
    metadata jsonb
);


--
-- Name: stock_location_address; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_location_address (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    address_1 text NOT NULL,
    address_2 text,
    company text,
    city text,
    country_code text NOT NULL,
    phone text,
    province text,
    postal_code text,
    metadata jsonb
);


--
-- Name: store; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.store (
    id text NOT NULL,
    name text DEFAULT 'Medusa Store'::text NOT NULL,
    default_sales_channel_id text,
    default_region_id text,
    default_location_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: store_currency; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.store_currency (
    id text NOT NULL,
    currency_code text NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    store_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: store_locale; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.store_locale (
    id text NOT NULL,
    locale_code text NOT NULL,
    store_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: tax_provider; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tax_provider (
    id text NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: tax_rate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tax_rate (
    id text NOT NULL,
    rate real,
    code text NOT NULL,
    name text NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    is_combinable boolean DEFAULT false NOT NULL,
    tax_region_id text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    deleted_at timestamp with time zone
);


--
-- Name: tax_rate_rule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tax_rate_rule (
    id text NOT NULL,
    tax_rate_id text NOT NULL,
    reference_id text NOT NULL,
    reference text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    deleted_at timestamp with time zone
);


--
-- Name: tax_region; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tax_region (
    id text NOT NULL,
    provider_id text,
    country_code text NOT NULL,
    province_code text,
    parent_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    deleted_at timestamp with time zone,
    CONSTRAINT "CK_tax_region_country_top_level" CHECK (((parent_id IS NULL) OR (province_code IS NOT NULL))),
    CONSTRAINT "CK_tax_region_provider_top_level" CHECK (((parent_id IS NULL) OR (provider_id IS NULL)))
);


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    id text NOT NULL,
    first_name text,
    last_name text,
    email text NOT NULL,
    avatar_url text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: user_preference; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_preference (
    id text NOT NULL,
    user_id text NOT NULL,
    key text NOT NULL,
    value jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: user_rbac_role; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_rbac_role (
    user_id character varying(255) NOT NULL,
    rbac_role_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: view_configuration; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.view_configuration (
    id text NOT NULL,
    entity text NOT NULL,
    name text,
    user_id text,
    is_system_default boolean DEFAULT false NOT NULL,
    configuration jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: workflow_execution; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workflow_execution (
    id character varying NOT NULL,
    workflow_id character varying NOT NULL,
    transaction_id character varying NOT NULL,
    execution jsonb,
    context jsonb,
    state character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    retention_time integer,
    run_id text DEFAULT '01M1SAPTVHS9GNB08HF9JCMR9J'::text NOT NULL
);


--
-- Name: link_module_migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.link_module_migrations ALTER COLUMN id SET DEFAULT nextval('public.link_module_migrations_id_seq'::regclass);


--
-- Name: mikro_orm_migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mikro_orm_migrations ALTER COLUMN id SET DEFAULT nextval('public.mikro_orm_migrations_id_seq'::regclass);


--
-- Name: order display_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."order" ALTER COLUMN display_id SET DEFAULT nextval('public.order_display_id_seq'::regclass);


--
-- Name: order_change_action ordering; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_change_action ALTER COLUMN ordering SET DEFAULT nextval('public.order_change_action_ordering_seq'::regclass);


--
-- Name: order_claim display_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_claim ALTER COLUMN display_id SET DEFAULT nextval('public.order_claim_display_id_seq'::regclass);


--
-- Name: order_exchange display_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_exchange ALTER COLUMN display_id SET DEFAULT nextval('public.order_exchange_display_id_seq'::regclass);


--
-- Name: password_reset_otp id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_otp ALTER COLUMN id SET DEFAULT nextval('public.password_reset_otp_id_seq'::regclass);


--
-- Name: return display_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.return ALTER COLUMN display_id SET DEFAULT nextval('public.return_display_id_seq'::regclass);


--
-- Name: script_migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.script_migrations ALTER COLUMN id SET DEFAULT nextval('public.script_migrations_id_seq'::regclass);


--
-- Data for Name: account_holder; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.account_holder (id, provider_id, external_id, email, data, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: admin_user; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_user (id, name, email, role_id, role_name, role_badge_color, role_icon, status, last_login, permissions, avatar_bg, created_at, updated_at, activation_token, password_hash) FROM stdin;
usr-002	Laura Sofia Benítez	laura.cms@pianocolombia.com	editor_cms	Editor de Contenido	bg-blue-100 text-blue-700 border-blue-200	edit_note	active	Ayer, 04:20 PM (IP: 181.132.45.10)	["Edición CMS Hero", "Gestión de Banners", "FAQ & Artículos"]	bg-[#0071BC]	2026-09-09 12:04:02.206494-05	2026-09-09 12:04:02.206494-05	\N	\N
usr-003	Santiago Bermúdez	santiago.moderacion@pianocolombia.com	moderador	Moderador de Partituras	bg-amber-100 text-amber-800 border-amber-200	verified	active	02 Sep 2026, 11:15 AM (IP: 190.24.18.99)	["Aprobar Partituras", "Verificar Compositores", "Revisión DRM PDF"]	bg-[#FBB03B] text-[#111C2D]	2026-09-09 12:04:02.208828-05	2026-09-09 12:04:02.208828-05	\N	\N
usr-004	Mariana Valencia Giraldo	mariana.tesoreria@pianocolombia.com	tesorero	Tesorero / Pagos	bg-emerald-100 text-emerald-800 border-emerald-200	payments	active	Hoy, 09:10 AM (IP: 200.21.140.2)	["Ejecutar Dispersión Wompi", "Exportar Certificados Fiscales", "Reportes DIAN"]	bg-emerald-700	2026-09-09 12:04:02.210308-05	2026-09-09 12:04:02.210308-05	\N	\N
usr-005	Felipe Osorio Cardona	felipe.editor@pianocolombia.com	editor_cms	Editor de Contenido	bg-blue-100 text-blue-700 border-blue-200	edit_note	inactive	15 Ago 2026, 03:30 PM	["Edición CMS Hero", "Gestión de Banners"]	bg-slate-600	2026-09-09 12:04:02.211516-05	2026-09-09 12:04:02.211516-05	\N	\N
usr-2872	Prueba Admin	prueba.admin@pianocolombia.com	editor_cms	Editor de Contenido	bg-blue-100 text-blue-700 border-blue-200	edit_note	active	Nunca (Invitación enviada)	["cms.read"]	bg-[#0071BC]	2026-09-09 12:06:02.873385-05	2026-09-09 12:06:02.873385-05	\N	\N
usr-001	Carlos Mario Restrepo	carlos.admin@pianocolombia.com	super_admin	Super Admin	bg-red-100 text-red-700 border-red-200	shield_person	active	Invitación reenviada recientmente	["Acceso Total", "Gestión de Usuarios", "CMS", "Aprobaciones", "Dispersión Pagos"]	bg-[#C1272D]	2026-09-09 12:04:02.196745-05	2026-09-09 12:30:10.69925-05	\N	\N
usr-2830	Enzo Fernandez	jivanit932@daugr.com	moderador	Moderador de Partituras	bg-amber-100 text-amber-800 border-amber-200	verified	active	Activo (Contraseña asignada por OTP)	["cms.read", "cms.write"]	bg-[#FBB03B] text-[#111C2D]	2026-09-09 12:31:02.831322-05	2026-09-09 13:30:53.659208-05	\N	1f03d17500c147ad3dc2674d55555f79:af25edd5b7fc057361d7c3881fc79b8a3f8ba269aece1b70289d7b4468a01a2882002952306de08044a848d6ec9d2fe348de7d433dbc4c5fb79b366d4ac07dc8
\.


--
-- Data for Name: api_key; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.api_key (id, token, salt, redacted, title, type, last_used_at, created_by, created_at, revoked_by, revoked_at, updated_at, deleted_at) FROM stdin;
apk_01M1SAV2SHCJ8CE1X1Y7CZNC2C	pk_0372bd6f8b5885e7dcfd759e152d7a9db36782d5eaace95f07e707f2e9f68ce3		pk_037***ce3	Default Publishable API Key	publishable	\N		2026-09-05 12:46:11.121-05	\N	\N	2026-09-05 12:46:11.121-05	\N
\.


--
-- Data for Name: application_method_buy_rules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.application_method_buy_rules (application_method_id, promotion_rule_id) FROM stdin;
\.


--
-- Data for Name: application_method_target_rules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.application_method_target_rules (application_method_id, promotion_rule_id) FROM stdin;
\.


--
-- Data for Name: auth_identity; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auth_identity (id, app_metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: auth_mfa_factor; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auth_mfa_factor (id, auth_identity_id, provider, status, provider_metadata, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: auth_mfa_recovery_code; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auth_mfa_recovery_code (id, auth_identity_id, code_hash, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: auth_password_reset_token; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auth_password_reset_token (id, auth_identity_id, provider_identity_id, entity_id, token_hash, expires_at, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: auth_verification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auth_verification (id, auth_identity_id, entity_id, entity_type, code_provider, verified_at, requested_at, provider_metadata, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: capture; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.capture (id, amount, raw_amount, payment_id, created_at, updated_at, deleted_at, created_by, metadata) FROM stdin;
\.


--
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart (id, region_id, customer_id, sales_channel_id, email, currency_code, shipping_address_id, billing_address_id, metadata, created_at, updated_at, deleted_at, completed_at, locale) FROM stdin;
\.


--
-- Data for Name: cart_address; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_address (id, customer_id, company, first_name, last_name, address_1, address_2, city, country_code, province, postal_code, phone, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: cart_line_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_line_item (id, cart_id, title, subtitle, thumbnail, quantity, variant_id, product_id, product_title, product_description, product_subtitle, product_type, product_collection, product_handle, variant_sku, variant_barcode, variant_title, variant_option_values, requires_shipping, is_discountable, is_tax_inclusive, compare_at_unit_price, raw_compare_at_unit_price, unit_price, raw_unit_price, metadata, created_at, updated_at, deleted_at, product_type_id, is_custom_price, is_giftcard) FROM stdin;
\.


--
-- Data for Name: cart_line_item_adjustment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_line_item_adjustment (id, description, promotion_id, code, amount, raw_amount, provider_id, metadata, created_at, updated_at, deleted_at, item_id, is_tax_inclusive) FROM stdin;
\.


--
-- Data for Name: cart_line_item_tax_line; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_line_item_tax_line (id, description, tax_rate_id, code, rate, provider_id, metadata, created_at, updated_at, deleted_at, item_id, data) FROM stdin;
\.


--
-- Data for Name: cart_payment_collection; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_payment_collection (cart_id, payment_collection_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: cart_promotion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_promotion (cart_id, promotion_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: cart_shipping_method; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_shipping_method (id, cart_id, name, description, amount, raw_amount, is_tax_inclusive, shipping_option_id, data, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: cart_shipping_method_adjustment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_shipping_method_adjustment (id, description, promotion_id, code, amount, raw_amount, provider_id, metadata, created_at, updated_at, deleted_at, shipping_method_id) FROM stdin;
\.


--
-- Data for Name: cart_shipping_method_tax_line; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_shipping_method_tax_line (id, description, tax_rate_id, code, rate, provider_id, metadata, created_at, updated_at, deleted_at, shipping_method_id, data) FROM stdin;
\.


--
-- Data for Name: composer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.composer (id, first_name, last_name, artistic_name, slug, bio_es, bio_en, region, era, photo_url, status, rejection_reason, user_id, email, phone, is_featured, created_at, updated_at, deleted_at, commission_percentage, password_hash, salt, approval_attempts) FROM stdin;
01M1SB1H6H5MJYYJ1BME04GSV9	Adolfo	Mejía	Adolfo Mejía Navarro	adolfo-mejia	Adolfo Mejía Navarro (1905-1973) fue un compositor y pedagogo colombiano. Su obra pianística combina elementos del folclor caribeño con técnicas de composición europea del impresionismo.	Adolfo Mejía Navarro (1905-1973) was a major Colombian composer whose piano works blend Caribbean folklore with French impressionist techniques.	Cartagena, Bolívar	Siglo XX (Nacionalismo)	/images/composers/adolfo-mejia.jpg	APPROVED	\N	\N	adolfomejia@patrimonio.gov.co	\N	t	2026-09-05 12:49:42.482-05	2026-09-05 12:49:42.482-05	\N	\N	\N	\N	1
01M1SB1H84VC58PYFDGPMSD637	Luis A.	Calvo	Luis Antonio Calvo	luis-a-calvo	Luis A. Calvo (1882-1945) es una figura cumbre de la música romántica colombiana, famoso por sus célebres Intermezzos e líricas piezas de salón.	Luis A. Calvo (1882-1945) was a leading romantic composer, known for his lyrical intermezzos and salón piano pieces.	Gámbita, Santander	Romanticismo Tardío	/images/composers/luis-a-calvo.jpg	APPROVED	\N	\N	luisacalvo@patrimonio.gov.co	\N	t	2026-09-05 12:49:42.532-05	2026-09-05 12:49:42.533-05	\N	\N	\N	\N	1
01M1SB1H8ZMDQB2MWW5PX689KN	Pedro	Morales Pino	Pedro Morales Pino	pedro-morales-pino	Pedro Morales Pino (1863-1926) transformó la música tradicional andina en repertorio de concierto, escribiendo pasillos, bambucos y gavotas.	Pedro Morales Pino (1863-1926) formalized Colombian Andean traditions into classical salon concert repertoire.	Cartago, Valle del Cauca	Siglo XIX - XX	/images/composers/pedro-morales-pino.jpg	APPROVED	\N	\N	moralespino@patrimonio.gov.co	\N	t	2026-09-05 12:49:42.559-05	2026-09-05 12:49:42.559-05	\N	\N	\N	\N	1
01M219P4DT4NMGJMRTJWKGX4NA	Alex	Ríos	El Cacique de la Junta	alex-rios-5824	Biografía ampliada y actualizada con trayectoria artística detallada y obras destacadas.	Expanded biography with artistic trajectory and prominent scores.	Bello, Antioquia / Región Andina	\N	http://localhost:9000/media?key=composers%2Fphotos%2F1788915822643-gemini-generated-image-53v9cz53v9cz53v9.jpg	APPROVED	\N	\N	edwin.soto@globalbit.co	+57 316 694 3197	f	2026-09-08 14:59:55.835-05	2026-09-09 15:29:28.839-05	\N	\N	65037cc633703e6eb5c1541ba52b9b5e7ff6e1f8e5522e4891578f1f48bab10698472fee907a0d50c34e2bd11d178378a0e80298f0ec9629f9cb50bbcaa10840	27e13b5e05f7bfb40acff2bd789d4999	3
\.


--
-- Data for Name: composer_bank_account; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.composer_bank_account (id, account_type, bank_code, bank_name, account_number, holder_name, document_type, document_number, composer_id, created_at, updated_at, deleted_at) FROM stdin;
01M1SB1H6YZT9M7M4CKMPZB0QS	AHORROS	\N	Bancolombia	245-890123-44	Herederos Adolfo Mejía	NIT	800.123.456-1	01M1SB1H6H5MJYYJ1BME04GSV9	2026-09-05 12:49:42.496-05	2026-09-05 12:49:42.496-05	\N
01M1SB1H89N55SG2TZF1YB87PW	CORRIENTE	\N	Banco de Bogotá	012-456789-01	Legado Luis A. Calvo	NIT	890.987.654-2	01M1SB1H84VC58PYFDGPMSD637	2026-09-05 12:49:42.538-05	2026-09-05 12:49:42.538-05	\N
01M1SB1H95GAP533D3J8F0F534	AHORROS	\N	Davivienda	450-112233-88	Sociedad Morales Pino	NIT	900.555.333-7	01M1SB1H8ZMDQB2MWW5PX689KN	2026-09-05 12:49:42.566-05	2026-09-05 12:49:42.566-05	\N
01M219P4ENJBAC7ZJNTRG9B3J1	AHORROS	\N	Bancolombia	12345678901	Alex Ríos	CC	1020304050	01M219P4DT4NMGJMRTJWKGX4NA	2026-09-08 14:59:55.863-05	2026-09-09 14:57:57.822474-05	\N
\.


--
-- Data for Name: credit_line; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.credit_line (id, cart_id, reference, reference_id, amount, raw_amount, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: currency; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.currency (code, symbol, symbol_native, decimal_digits, rounding, raw_rounding, name, created_at, updated_at, deleted_at) FROM stdin;
usd	$	$	2	0	{"value": "0", "precision": 20}	US Dollar	2026-09-05 12:44:14.901-05	2026-09-05 12:44:14.901-05	\N
cad	CA$	$	2	0	{"value": "0", "precision": 20}	Canadian Dollar	2026-09-05 12:44:14.904-05	2026-09-05 12:44:14.904-05	\N
eur	€	€	2	0	{"value": "0", "precision": 20}	Euro	2026-09-05 12:44:14.904-05	2026-09-05 12:44:14.904-05	\N
aed	AED	د.إ.‏	2	0	{"value": "0", "precision": 20}	United Arab Emirates Dirham	2026-09-05 12:44:14.905-05	2026-09-05 12:44:14.905-05	\N
afn	Af	؋	0	0	{"value": "0", "precision": 20}	Afghan Afghani	2026-09-05 12:44:14.905-05	2026-09-05 12:44:14.905-05	\N
all	ALL	Lek	0	0	{"value": "0", "precision": 20}	Albanian Lek	2026-09-05 12:44:14.905-05	2026-09-05 12:44:14.905-05	\N
amd	AMD	դր.	0	0	{"value": "0", "precision": 20}	Armenian Dram	2026-09-05 12:44:14.905-05	2026-09-05 12:44:14.905-05	\N
aoa	AOA	Kz	2	0	{"value": "0", "precision": 20}	Angolan Kwanza	2026-09-05 12:44:14.906-05	2026-09-05 12:44:14.906-05	\N
ars	AR$	$	2	0	{"value": "0", "precision": 20}	Argentine Peso	2026-09-05 12:44:14.906-05	2026-09-05 12:44:14.906-05	\N
aud	AU$	$	2	0	{"value": "0", "precision": 20}	Australian Dollar	2026-09-05 12:44:14.906-05	2026-09-05 12:44:14.906-05	\N
azn	man.	ман.	2	0	{"value": "0", "precision": 20}	Azerbaijani Manat	2026-09-05 12:44:14.906-05	2026-09-05 12:44:14.906-05	\N
bam	KM	KM	2	0	{"value": "0", "precision": 20}	Bosnia-Herzegovina Convertible Mark	2026-09-05 12:44:14.906-05	2026-09-05 12:44:14.906-05	\N
bdt	Tk	৳	2	0	{"value": "0", "precision": 20}	Bangladeshi Taka	2026-09-05 12:44:14.907-05	2026-09-05 12:44:14.907-05	\N
bgn	BGN	лв.	2	0	{"value": "0", "precision": 20}	Bulgarian Lev	2026-09-05 12:44:14.907-05	2026-09-05 12:44:14.907-05	\N
bhd	BD	د.ب.‏	3	0	{"value": "0", "precision": 20}	Bahraini Dinar	2026-09-05 12:44:14.907-05	2026-09-05 12:44:14.907-05	\N
bif	FBu	FBu	0	0	{"value": "0", "precision": 20}	Burundian Franc	2026-09-05 12:44:14.907-05	2026-09-05 12:44:14.907-05	\N
bnd	BN$	$	2	0	{"value": "0", "precision": 20}	Brunei Dollar	2026-09-05 12:44:14.907-05	2026-09-05 12:44:14.907-05	\N
bob	Bs	Bs	2	0	{"value": "0", "precision": 20}	Bolivian Boliviano	2026-09-05 12:44:14.908-05	2026-09-05 12:44:14.908-05	\N
brl	R$	R$	2	0	{"value": "0", "precision": 20}	Brazilian Real	2026-09-05 12:44:14.908-05	2026-09-05 12:44:14.908-05	\N
bwp	BWP	P	2	0	{"value": "0", "precision": 20}	Botswanan Pula	2026-09-05 12:44:14.908-05	2026-09-05 12:44:14.908-05	\N
byn	Br	руб.	2	0	{"value": "0", "precision": 20}	Belarusian Ruble	2026-09-05 12:44:14.908-05	2026-09-05 12:44:14.908-05	\N
bzd	BZ$	$	2	0	{"value": "0", "precision": 20}	Belize Dollar	2026-09-05 12:44:14.908-05	2026-09-05 12:44:14.908-05	\N
cdf	CDF	FrCD	2	0	{"value": "0", "precision": 20}	Congolese Franc	2026-09-05 12:44:14.908-05	2026-09-05 12:44:14.908-05	\N
chf	CHF	CHF	2	0.05	{"value": "0.05", "precision": 20}	Swiss Franc	2026-09-05 12:44:14.908-05	2026-09-05 12:44:14.908-05	\N
clp	CL$	$	0	0	{"value": "0", "precision": 20}	Chilean Peso	2026-09-05 12:44:14.909-05	2026-09-05 12:44:14.909-05	\N
cny	CN¥	CN¥	2	0	{"value": "0", "precision": 20}	Chinese Yuan	2026-09-05 12:44:14.909-05	2026-09-05 12:44:14.909-05	\N
cop	CO$	$	0	0	{"value": "0", "precision": 20}	Colombian Peso	2026-09-05 12:44:14.909-05	2026-09-05 12:44:14.909-05	\N
crc	₡	₡	0	0	{"value": "0", "precision": 20}	Costa Rican Colón	2026-09-05 12:44:14.909-05	2026-09-05 12:44:14.909-05	\N
cve	CV$	CV$	2	0	{"value": "0", "precision": 20}	Cape Verdean Escudo	2026-09-05 12:44:14.909-05	2026-09-05 12:44:14.909-05	\N
czk	Kč	Kč	2	0	{"value": "0", "precision": 20}	Czech Republic Koruna	2026-09-05 12:44:14.909-05	2026-09-05 12:44:14.909-05	\N
djf	Fdj	Fdj	0	0	{"value": "0", "precision": 20}	Djiboutian Franc	2026-09-05 12:44:14.909-05	2026-09-05 12:44:14.909-05	\N
dkk	Dkr	kr	2	0	{"value": "0", "precision": 20}	Danish Krone	2026-09-05 12:44:14.909-05	2026-09-05 12:44:14.909-05	\N
dop	RD$	RD$	2	0	{"value": "0", "precision": 20}	Dominican Peso	2026-09-05 12:44:14.909-05	2026-09-05 12:44:14.909-05	\N
dzd	DA	د.ج.‏	2	0	{"value": "0", "precision": 20}	Algerian Dinar	2026-09-05 12:44:14.912-05	2026-09-05 12:44:14.912-05	\N
eek	Ekr	kr	2	0	{"value": "0", "precision": 20}	Estonian Kroon	2026-09-05 12:44:14.912-05	2026-09-05 12:44:14.912-05	\N
egp	EGP	ج.م.‏	2	0	{"value": "0", "precision": 20}	Egyptian Pound	2026-09-05 12:44:14.913-05	2026-09-05 12:44:14.913-05	\N
ern	Nfk	Nfk	2	0	{"value": "0", "precision": 20}	Eritrean Nakfa	2026-09-05 12:44:14.913-05	2026-09-05 12:44:14.913-05	\N
etb	Br	Br	2	0	{"value": "0", "precision": 20}	Ethiopian Birr	2026-09-05 12:44:14.913-05	2026-09-05 12:44:14.913-05	\N
gbp	£	£	2	0	{"value": "0", "precision": 20}	British Pound Sterling	2026-09-05 12:44:14.913-05	2026-09-05 12:44:14.913-05	\N
gel	GEL	GEL	2	0	{"value": "0", "precision": 20}	Georgian Lari	2026-09-05 12:44:14.913-05	2026-09-05 12:44:14.913-05	\N
ghs	GH₵	GH₵	2	0	{"value": "0", "precision": 20}	Ghanaian Cedi	2026-09-05 12:44:14.913-05	2026-09-05 12:44:14.913-05	\N
gmd	D	D	2	0	{"value": "0", "precision": 20}	Gambian Dalasi	2026-09-05 12:44:14.914-05	2026-09-05 12:44:14.914-05	\N
gnf	FG	FG	0	0	{"value": "0", "precision": 20}	Guinean Franc	2026-09-05 12:44:14.914-05	2026-09-05 12:44:14.914-05	\N
gtq	GTQ	Q	2	0	{"value": "0", "precision": 20}	Guatemalan Quetzal	2026-09-05 12:44:14.914-05	2026-09-05 12:44:14.914-05	\N
hkd	HK$	$	2	0	{"value": "0", "precision": 20}	Hong Kong Dollar	2026-09-05 12:44:14.914-05	2026-09-05 12:44:14.914-05	\N
hnl	HNL	L	2	0	{"value": "0", "precision": 20}	Honduran Lempira	2026-09-05 12:44:14.914-05	2026-09-05 12:44:14.914-05	\N
hrk	kn	kn	2	0	{"value": "0", "precision": 20}	Croatian Kuna	2026-09-05 12:44:14.914-05	2026-09-05 12:44:14.914-05	\N
huf	Ft	Ft	0	0	{"value": "0", "precision": 20}	Hungarian Forint	2026-09-05 12:44:14.914-05	2026-09-05 12:44:14.914-05	\N
idr	Rp	Rp	0	0	{"value": "0", "precision": 20}	Indonesian Rupiah	2026-09-05 12:44:14.914-05	2026-09-05 12:44:14.914-05	\N
ils	₪	₪	2	0	{"value": "0", "precision": 20}	Israeli New Sheqel	2026-09-05 12:44:14.915-05	2026-09-05 12:44:14.915-05	\N
inr	Rs	₹	2	0	{"value": "0", "precision": 20}	Indian Rupee	2026-09-05 12:44:14.916-05	2026-09-05 12:44:14.916-05	\N
iqd	IQD	د.ع.‏	0	0	{"value": "0", "precision": 20}	Iraqi Dinar	2026-09-05 12:44:14.916-05	2026-09-05 12:44:14.916-05	\N
irr	IRR	﷼	0	0	{"value": "0", "precision": 20}	Iranian Rial	2026-09-05 12:44:14.916-05	2026-09-05 12:44:14.916-05	\N
irt	IRT	تومان	0	0	{"value": "0", "precision": 20}	Iranian Toman	2026-09-05 12:44:14.916-05	2026-09-05 12:44:14.916-05	\N
isk	Ikr	kr	0	0	{"value": "0", "precision": 20}	Icelandic Króna	2026-09-05 12:44:14.916-05	2026-09-05 12:44:14.916-05	\N
jmd	J$	$	2	0	{"value": "0", "precision": 20}	Jamaican Dollar	2026-09-05 12:44:14.917-05	2026-09-05 12:44:14.917-05	\N
jod	JD	د.أ.‏	3	0	{"value": "0", "precision": 20}	Jordanian Dinar	2026-09-05 12:44:14.917-05	2026-09-05 12:44:14.917-05	\N
jpy	¥	￥	0	0	{"value": "0", "precision": 20}	Japanese Yen	2026-09-05 12:44:14.917-05	2026-09-05 12:44:14.917-05	\N
kes	Ksh	Ksh	2	0	{"value": "0", "precision": 20}	Kenyan Shilling	2026-09-05 12:44:14.918-05	2026-09-05 12:44:14.918-05	\N
khr	KHR	៛	2	0	{"value": "0", "precision": 20}	Cambodian Riel	2026-09-05 12:44:14.919-05	2026-09-05 12:44:14.919-05	\N
kmf	CF	FC	0	0	{"value": "0", "precision": 20}	Comorian Franc	2026-09-05 12:44:14.925-05	2026-09-05 12:44:14.925-05	\N
krw	₩	₩	0	0	{"value": "0", "precision": 20}	South Korean Won	2026-09-05 12:44:14.925-05	2026-09-05 12:44:14.925-05	\N
kwd	KD	د.ك.‏	3	0	{"value": "0", "precision": 20}	Kuwaiti Dinar	2026-09-05 12:44:14.925-05	2026-09-05 12:44:14.925-05	\N
kzt	KZT	тңг.	2	0	{"value": "0", "precision": 20}	Kazakhstani Tenge	2026-09-05 12:44:14.925-05	2026-09-05 12:44:14.925-05	\N
lbp	LB£	ل.ل.‏	0	0	{"value": "0", "precision": 20}	Lebanese Pound	2026-09-05 12:44:14.925-05	2026-09-05 12:44:14.925-05	\N
lkr	SLRs	SL Re	2	0	{"value": "0", "precision": 20}	Sri Lankan Rupee	2026-09-05 12:44:14.925-05	2026-09-05 12:44:14.925-05	\N
ltl	Lt	Lt	2	0	{"value": "0", "precision": 20}	Lithuanian Litas	2026-09-05 12:44:14.926-05	2026-09-05 12:44:14.926-05	\N
lvl	Ls	Ls	2	0	{"value": "0", "precision": 20}	Latvian Lats	2026-09-05 12:44:14.926-05	2026-09-05 12:44:14.926-05	\N
lyd	LD	د.ل.‏	3	0	{"value": "0", "precision": 20}	Libyan Dinar	2026-09-05 12:44:14.928-05	2026-09-05 12:44:14.928-05	\N
mad	MAD	د.م.‏	2	0	{"value": "0", "precision": 20}	Moroccan Dirham	2026-09-05 12:44:14.929-05	2026-09-05 12:44:14.929-05	\N
mdl	MDL	MDL	2	0	{"value": "0", "precision": 20}	Moldovan Leu	2026-09-05 12:44:14.929-05	2026-09-05 12:44:14.929-05	\N
mga	MGA	MGA	0	0	{"value": "0", "precision": 20}	Malagasy Ariary	2026-09-05 12:44:14.929-05	2026-09-05 12:44:14.929-05	\N
mkd	MKD	MKD	2	0	{"value": "0", "precision": 20}	Macedonian Denar	2026-09-05 12:44:14.929-05	2026-09-05 12:44:14.929-05	\N
mmk	MMK	K	0	0	{"value": "0", "precision": 20}	Myanma Kyat	2026-09-05 12:44:14.929-05	2026-09-05 12:44:14.929-05	\N
mnt	MNT	₮	0	0	{"value": "0", "precision": 20}	Mongolian Tugrig	2026-09-05 12:44:14.929-05	2026-09-05 12:44:14.929-05	\N
mop	MOP$	MOP$	2	0	{"value": "0", "precision": 20}	Macanese Pataca	2026-09-05 12:44:14.929-05	2026-09-05 12:44:14.929-05	\N
mur	MURs	MURs	0	0	{"value": "0", "precision": 20}	Mauritian Rupee	2026-09-05 12:44:14.929-05	2026-09-05 12:44:14.929-05	\N
mwk	K	K	2	0	{"value": "0", "precision": 20}	Malawian Kwacha	2026-09-05 12:44:14.929-05	2026-09-05 12:44:14.929-05	\N
mxn	MX$	$	2	0	{"value": "0", "precision": 20}	Mexican Peso	2026-09-05 12:44:14.929-05	2026-09-05 12:44:14.929-05	\N
myr	RM	RM	2	0	{"value": "0", "precision": 20}	Malaysian Ringgit	2026-09-05 12:44:14.93-05	2026-09-05 12:44:14.93-05	\N
mzn	MTn	MTn	2	0	{"value": "0", "precision": 20}	Mozambican Metical	2026-09-05 12:44:14.93-05	2026-09-05 12:44:14.93-05	\N
nad	N$	N$	2	0	{"value": "0", "precision": 20}	Namibian Dollar	2026-09-05 12:44:14.93-05	2026-09-05 12:44:14.93-05	\N
ngn	₦	₦	2	0	{"value": "0", "precision": 20}	Nigerian Naira	2026-09-05 12:44:14.93-05	2026-09-05 12:44:14.93-05	\N
nio	C$	C$	2	0	{"value": "0", "precision": 20}	Nicaraguan Córdoba	2026-09-05 12:44:14.93-05	2026-09-05 12:44:14.93-05	\N
nok	Nkr	kr	2	0	{"value": "0", "precision": 20}	Norwegian Krone	2026-09-05 12:44:14.93-05	2026-09-05 12:44:14.93-05	\N
npr	NPRs	नेरू	2	0	{"value": "0", "precision": 20}	Nepalese Rupee	2026-09-05 12:44:14.93-05	2026-09-05 12:44:14.93-05	\N
nzd	NZ$	$	2	0	{"value": "0", "precision": 20}	New Zealand Dollar	2026-09-05 12:44:14.93-05	2026-09-05 12:44:14.93-05	\N
omr	OMR	ر.ع.‏	3	0	{"value": "0", "precision": 20}	Omani Rial	2026-09-05 12:44:14.93-05	2026-09-05 12:44:14.93-05	\N
pab	B/.	B/.	2	0	{"value": "0", "precision": 20}	Panamanian Balboa	2026-09-05 12:44:14.93-05	2026-09-05 12:44:14.93-05	\N
pen	S/.	S/.	2	0	{"value": "0", "precision": 20}	Peruvian Nuevo Sol	2026-09-05 12:44:14.93-05	2026-09-05 12:44:14.93-05	\N
php	₱	₱	2	0	{"value": "0", "precision": 20}	Philippine Peso	2026-09-05 12:44:14.931-05	2026-09-05 12:44:14.931-05	\N
pkr	PKRs	₨	0	0	{"value": "0", "precision": 20}	Pakistani Rupee	2026-09-05 12:44:14.931-05	2026-09-05 12:44:14.931-05	\N
pln	zł	zł	2	0	{"value": "0", "precision": 20}	Polish Zloty	2026-09-05 12:44:14.931-05	2026-09-05 12:44:14.931-05	\N
pyg	₲	₲	0	0	{"value": "0", "precision": 20}	Paraguayan Guarani	2026-09-05 12:44:14.931-05	2026-09-05 12:44:14.931-05	\N
qar	QR	ر.ق.‏	2	0	{"value": "0", "precision": 20}	Qatari Rial	2026-09-05 12:44:14.931-05	2026-09-05 12:44:14.931-05	\N
ron	RON	RON	2	0	{"value": "0", "precision": 20}	Romanian Leu	2026-09-05 12:44:14.931-05	2026-09-05 12:44:14.931-05	\N
rsd	din.	дин.	0	0	{"value": "0", "precision": 20}	Serbian Dinar	2026-09-05 12:44:14.931-05	2026-09-05 12:44:14.931-05	\N
rub	RUB	₽.	2	0	{"value": "0", "precision": 20}	Russian Ruble	2026-09-05 12:44:14.931-05	2026-09-05 12:44:14.931-05	\N
rwf	RWF	FR	0	0	{"value": "0", "precision": 20}	Rwandan Franc	2026-09-05 12:44:14.931-05	2026-09-05 12:44:14.931-05	\N
sar	SR	ر.س.‏	2	0	{"value": "0", "precision": 20}	Saudi Riyal	2026-09-05 12:44:14.931-05	2026-09-05 12:44:14.931-05	\N
sdg	SDG	SDG	2	0	{"value": "0", "precision": 20}	Sudanese Pound	2026-09-05 12:44:14.931-05	2026-09-05 12:44:14.931-05	\N
sek	Skr	kr	2	0	{"value": "0", "precision": 20}	Swedish Krona	2026-09-05 12:44:14.931-05	2026-09-05 12:44:14.931-05	\N
sgd	S$	$	2	0	{"value": "0", "precision": 20}	Singapore Dollar	2026-09-05 12:44:14.932-05	2026-09-05 12:44:14.932-05	\N
sos	Ssh	Ssh	0	0	{"value": "0", "precision": 20}	Somali Shilling	2026-09-05 12:44:14.932-05	2026-09-05 12:44:14.932-05	\N
syp	SY£	ل.س.‏	0	0	{"value": "0", "precision": 20}	Syrian Pound	2026-09-05 12:44:14.932-05	2026-09-05 12:44:14.932-05	\N
thb	฿	฿	2	0	{"value": "0", "precision": 20}	Thai Baht	2026-09-05 12:44:14.932-05	2026-09-05 12:44:14.932-05	\N
tnd	DT	د.ت.‏	3	0	{"value": "0", "precision": 20}	Tunisian Dinar	2026-09-05 12:44:14.932-05	2026-09-05 12:44:14.932-05	\N
top	T$	T$	2	0	{"value": "0", "precision": 20}	Tongan Paʻanga	2026-09-05 12:44:14.932-05	2026-09-05 12:44:14.932-05	\N
tjs	TJS	с.	2	0	{"value": "0", "precision": 20}	Tajikistani Somoni	2026-09-05 12:44:14.932-05	2026-09-05 12:44:14.932-05	\N
try	₺	₺	2	0	{"value": "0", "precision": 20}	Turkish Lira	2026-09-05 12:44:14.932-05	2026-09-05 12:44:14.932-05	\N
ttd	TT$	$	2	0	{"value": "0", "precision": 20}	Trinidad and Tobago Dollar	2026-09-05 12:44:14.932-05	2026-09-05 12:44:14.932-05	\N
twd	NT$	NT$	2	0	{"value": "0", "precision": 20}	New Taiwan Dollar	2026-09-05 12:44:14.932-05	2026-09-05 12:44:14.932-05	\N
tzs	TSh	TSh	0	0	{"value": "0", "precision": 20}	Tanzanian Shilling	2026-09-05 12:44:14.932-05	2026-09-05 12:44:14.932-05	\N
uah	₴	₴	2	0	{"value": "0", "precision": 20}	Ukrainian Hryvnia	2026-09-05 12:44:14.933-05	2026-09-05 12:44:14.933-05	\N
ugx	USh	USh	0	0	{"value": "0", "precision": 20}	Ugandan Shilling	2026-09-05 12:44:14.933-05	2026-09-05 12:44:14.933-05	\N
uyu	$U	$	2	0	{"value": "0", "precision": 20}	Uruguayan Peso	2026-09-05 12:44:14.933-05	2026-09-05 12:44:14.933-05	\N
uzs	UZS	UZS	0	0	{"value": "0", "precision": 20}	Uzbekistan Som	2026-09-05 12:44:14.933-05	2026-09-05 12:44:14.933-05	\N
vef	Bs.F.	Bs.F.	2	0	{"value": "0", "precision": 20}	Venezuelan Bolívar	2026-09-05 12:44:14.933-05	2026-09-05 12:44:14.933-05	\N
vnd	₫	₫	0	0	{"value": "0", "precision": 20}	Vietnamese Dong	2026-09-05 12:44:14.933-05	2026-09-05 12:44:14.933-05	\N
xaf	FCFA	FCFA	0	0	{"value": "0", "precision": 20}	CFA Franc BEAC	2026-09-05 12:44:14.933-05	2026-09-05 12:44:14.933-05	\N
xof	CFA	CFA	0	0	{"value": "0", "precision": 20}	CFA Franc BCEAO	2026-09-05 12:44:14.933-05	2026-09-05 12:44:14.933-05	\N
xpf	₣	₣	0	0	{"value": "0", "precision": 20}	CFP Franc	2026-09-05 12:44:14.933-05	2026-09-05 12:44:14.933-05	\N
yer	YR	ر.ي.‏	0	0	{"value": "0", "precision": 20}	Yemeni Rial	2026-09-05 12:44:14.933-05	2026-09-05 12:44:14.933-05	\N
zar	R	R	2	0	{"value": "0", "precision": 20}	South African Rand	2026-09-05 12:44:14.933-05	2026-09-05 12:44:14.933-05	\N
zmk	ZK	ZK	0	0	{"value": "0", "precision": 20}	Zambian Kwacha	2026-09-05 12:44:14.934-05	2026-09-05 12:44:14.934-05	\N
zwl	ZWL$	ZWL$	0	0	{"value": "0", "precision": 20}	Zimbabwean Dollar	2026-09-05 12:44:14.934-05	2026-09-05 12:44:14.934-05	\N
\.


--
-- Data for Name: customer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer (id, company_name, first_name, last_name, email, phone, has_account, metadata, created_at, updated_at, deleted_at, created_by) FROM stdin;
\.


--
-- Data for Name: customer_account; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_account (id, email, first_name, last_name, password_hash, salt, phone, tax_id, is_active, created_at, updated_at, deleted_at) FROM stdin;
01M1SDTEZ91SXJ4S3N94SC0W1W	juan@ejemplo.com	Juan	Pérez	3074efb16b6a2fc25703d30611f45f333accc4e8db5067acaa93a8550514ef66f8dbc08e4d0a867b91c0d26dbd4c38cdb36434dfff8a252346ceea265ae941b7	0bd697e0397fc1216c991c60bd8a3009	+57 300 123 4567	CC 19.482.910	t	2026-09-05 13:38:16.555-05	2026-09-05 13:38:16.555-05	\N
01M1SDTF0C9H200Y36JABNBER0	maria@conservatorio.edu.co	María	Gómez	569b2e238403339cbf078c15eaa7db5a8f8f52b2ff3a3536372e472bdce104697cc010f57c02576b982d6244d0091f95e585c3a12899bc492370863e249ad531	de7f1ee64ae275a8eeb25fabb0c74fd4	+57 312 987 6543	CC 52.819.021	t	2026-09-05 13:38:16.588-05	2026-09-05 13:38:16.588-05	\N
01M1SDTF10B2MCS6DNS3BSJZ2B	carlos.restrepo@pianocolombia.com	Carlos	Restrepo	eed3c8cc19fff6812480f17d8502663974b2d7ea8896f4a79649b08053ac1e006f8a1ec4aabe998a8cb4cac5d23c550c8acd25ee01025af7a26ca92f509f4630	741ed421067d957341bd56d4cefed5e5	+57 310 555 8899	CC 79.481.092	t	2026-09-05 13:38:16.609-05	2026-09-05 13:38:16.609-05	\N
01M1SF01TJEZ0ZKHDGR7STP4PW	test_nuevo_1788634728243@conservatorio.edu.co	Pianista	Prueba Automatizada	4cf55262b91789700d0b8aa42f8135bff74957bbdc3a09291d707957eeabfc21b8ed50947b561ec85618c42bbd2836735b49b18ee0c23efab305c457274daef6	c14d1dd6f664bb1ac967cbf66f80fce9	\N	\N	t	2026-09-05 13:58:48.275-05	2026-09-05 13:58:48.275-05	\N
01M1SF2V0SD69RSDT92RSJT5N2	test_nuevo_1788634819575@conservatorio.edu.co	Pianista	Prueba Automatizada	a8f68993e01da41f0eafb0782a3b5de3a640075bf2e4d6e438cb8bc85d595a846edd141be05f4321834a2988dfbe765b977d4c27d6d1d9eadfad82650d6fa478	4ada2ab18c3949d28628373568c8806f	\N	\N	t	2026-09-05 14:00:19.609-05	2026-09-05 14:00:19.609-05	\N
01M1SFFZRG1RK0ZE5RMS0M2XNY	test_nuevo_1788635250422@conservatorio.edu.co	Pianista	Prueba Automatizada	586d5170943ccaa7d1dd28ee0a18cf764dccf6f6cf7874f8dbda05381b8afdecf15548a514513ec9c2d1b13a7343b732704c02045d42cc000c1cbdd2fa896e42	b05dd71f1deaeb925c6aaeffc77e193a	\N	\N	t	2026-09-05 14:07:30.449-05	2026-09-05 14:07:30.449-05	\N
01M1SHZS4BZCE9EBK7W4AS5CFN	daetobo0693@gmail.com	Daniel	Escobar	505832aed92ade9baa0a4213698979bddf3c8e09072a3fa2b7b0518b6ce6177df829a43dc6b422eee0bc916726208145d30e6e4c68952f0e6a983a12a339bfff	efbf95a47638943ffc07d7a9005e9551	\N	\N	t	2026-09-05 14:51:05.1-05	2026-09-05 14:51:05.1-05	\N
01M1SMECRATQ5YZ67FEEPY5W4P	usuario.google@gmail.com	usuario	google	b0342f3c7fe1cad8c00a2db4991068fe15b8f7919ce6180b3ffc2d6c1c4e55b70853a799231208af696bab62e5aecaaa32c1f52febdf8e2854a8b3d1188b80ed	471e4e75e3c575ea40cd2740f329a5f5	\N	\N	t	2026-09-05 15:34:01.101-05	2026-09-05 15:34:01.101-05	\N
01M1SN64WD4H8DSW3DJ1B39CSH	edwinsou@gmail.com	Edwin	Soto	81ea4aa2c9c44bef3256d3b6e942969266ffb7ec7e259290ff548493bde05f3aae42591ed01a9d131f3705e2eced71edf7367a6aa9ea8b8feb192be182235e36	16784cfde1946ca8428bd4b4771359b0	\N	\N	t	2026-09-05 15:46:59.47-05	2026-09-05 15:46:59.47-05	\N
01M1SNP5GT1WBR3MJ922B0NARM	lygobalvin.9@gmail.com	Yohana	Gomez Balvin	6b3b883eaad4310121643b591ccf5aea8c401e26cb1777e6c6efaf2fba2b6923b17a2576b28d0d2fdc33befd414876d65b9314fbf394b783c0b4d8b6f5732ec3	e705e15689d0cbd18f11323667afc1c4	\N	\N	t	2026-09-05 15:55:44.411-05	2026-09-05 15:55:44.411-05	\N
01M216EZ704D9K854AD7R74DQJ	easoto@loteriademedellin.com.co	Alex	Rios	70b5bacf8650b2f1bbb2ed82fe7193274f8d31005f97d292ea1ee463c4f5280a972a4389826dba20a132ecfd2be50984f2d3587ab8b5f09f655abf89df6a528d	712b7f875767a85224dcc45bb8e153d9	\N	\N	t	2026-09-08 14:03:35.393-05	2026-09-08 14:28:16.251-05	\N
\.


--
-- Data for Name: customer_account_holder; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_account_holder (customer_id, account_holder_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: customer_address; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_address (id, customer_id, address_name, is_default_shipping, is_default_billing, company, first_name, last_name, address_1, address_2, city, country_code, province, postal_code, phone, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: customer_download; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_download (id, order_id, customer_id, score_id, score_title, composer_name, download_token, download_count, max_downloads, watermark_text, watermarked_file_url, wompi_transaction_id, buyer_name, buyer_email, buyer_tax_id, expires_at, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: customer_group; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_group (id, name, metadata, created_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: customer_group_customer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_group_customer (id, customer_id, customer_group_id, metadata, created_at, updated_at, created_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: fulfillment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fulfillment (id, location_id, packed_at, shipped_at, delivered_at, canceled_at, data, provider_id, shipping_option_id, metadata, delivery_address_id, created_at, updated_at, deleted_at, marked_shipped_by, created_by, requires_shipping) FROM stdin;
\.


--
-- Data for Name: fulfillment_address; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fulfillment_address (id, company, first_name, last_name, address_1, address_2, city, country_code, province, postal_code, phone, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: fulfillment_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fulfillment_item (id, title, sku, barcode, quantity, raw_quantity, line_item_id, inventory_item_id, fulfillment_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: fulfillment_label; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fulfillment_label (id, tracking_number, tracking_url, label_url, fulfillment_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: fulfillment_provider; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fulfillment_provider (id, is_enabled, created_at, updated_at, deleted_at) FROM stdin;
manual_manual	t	2026-09-05 12:44:15.358-05	2026-09-05 12:44:15.358-05	\N
\.


--
-- Data for Name: fulfillment_set; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fulfillment_set (id, name, type, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: geo_zone; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.geo_zone (id, type, country_code, province_code, city, service_zone_id, postal_expression, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: hero_content; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hero_content (id, title_part1, title_part2_highlight, description, button1_text, button1_url, button2_text, button2_url, urtext_badge_text, featured_score_slug, is_active, created_at, updated_at, deleted_at, featured_genre, featured_title, featured_author, featured_tempo, featured_ismn, featured_audio_sample, featured_audio_url, featured_badge_text, featured_link_url) FROM stdin;
01M1SB1H55WBC7S3C0KB52F9XN	La tradición del piano colombiano y latinoamericano en tus manos.		Un proyecto cultural con enfoque musical riguroso...	Explorar Partituras	/tienda	Conocer Compositores	/compositores	Edición revisada con digitaciones de concierto y notas históricas bilingües (ES/EN).	malvaloca	t	2026-09-05 12:49:42.437-05	2026-09-12 10:57:26.979-05	\N	PASILLO LÍRICO	Malvaloca	Luis A. Calvo (1882–1945) - Op. 12	Andante cantabile ♩ = 68	ISMN 979-0-901314-18-2	Luis A. Calvo - Malvaloca	http://localhost:9000/media?key=audio-samples/1789226675241-the-mountain-piano-556110.mp3	GRABADO URTEXT 100% Alta Resolución	/partitura/malvaloca
\.


--
-- Data for Name: image; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.image (id, url, metadata, created_at, updated_at, deleted_at, rank, product_id) FROM stdin;
\.


--
-- Data for Name: inventory_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_item (id, created_at, updated_at, deleted_at, sku, origin_country, hs_code, mid_code, material, weight, length, height, width, requires_shipping, description, title, thumbnail, metadata) FROM stdin;
\.


--
-- Data for Name: inventory_level; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_level (id, created_at, updated_at, deleted_at, inventory_item_id, location_id, stocked_quantity, reserved_quantity, incoming_quantity, metadata, raw_stocked_quantity, raw_reserved_quantity, raw_incoming_quantity) FROM stdin;
\.


--
-- Data for Name: invite; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invite (id, email, accepted, token, expires_at, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: invite_rbac_role; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invite_rbac_role (invite_id, rbac_role_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: layout_configuration; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.layout_configuration (id, zone, user_id, is_system_default, configuration, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: link_module_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.link_module_migrations (id, table_name, link_descriptor, created_at) FROM stdin;
1	cart_payment_collection	{"toModel": "payment_collection", "toModule": "payment", "fromModel": "cart", "fromModule": "cart"}	2026-09-05 12:43:54.335919
2	cart_promotion	{"toModel": "promotions", "toModule": "promotion", "fromModel": "cart", "fromModule": "cart"}	2026-09-05 12:43:54.402209
3	customer_account_holder	{"toModel": "account_holder", "toModule": "payment", "fromModel": "customer", "fromModule": "customer"}	2026-09-05 12:43:54.446803
4	location_fulfillment_provider	{"toModel": "fulfillment_provider", "toModule": "fulfillment", "fromModel": "location", "fromModule": "stock_location"}	2026-09-05 12:43:54.489153
5	location_fulfillment_set	{"toModel": "fulfillment_set", "toModule": "fulfillment", "fromModel": "location", "fromModule": "stock_location"}	2026-09-05 12:43:54.532224
6	invite_rbac_role	{"toModel": "rbac_role", "toModule": "rbac", "fromModel": "invite", "fromModule": "user"}	2026-09-05 12:43:54.572149
7	order_cart	{"toModel": "cart", "toModule": "cart", "fromModel": "order", "fromModule": "order"}	2026-09-05 12:43:54.614227
8	order_fulfillment	{"toModel": "fulfillments", "toModule": "fulfillment", "fromModel": "order", "fromModule": "order"}	2026-09-05 12:43:54.655719
9	order_payment_collection	{"toModel": "payment_collection", "toModule": "payment", "fromModel": "order", "fromModule": "order"}	2026-09-05 12:43:54.701178
10	order_promotion	{"toModel": "promotions", "toModule": "promotion", "fromModel": "order", "fromModule": "order"}	2026-09-05 12:43:54.744708
11	return_fulfillment	{"toModel": "fulfillments", "toModule": "fulfillment", "fromModel": "return", "fromModule": "order"}	2026-09-05 12:43:54.784035
12	product_sales_channel	{"toModel": "sales_channel", "toModule": "sales_channel", "fromModel": "product", "fromModule": "product"}	2026-09-05 12:43:54.824044
13	product_shipping_profile	{"toModel": "shipping_profile", "toModule": "fulfillment", "fromModel": "product", "fromModule": "product"}	2026-09-05 12:43:54.867234
14	product_variant_inventory_item	{"toModel": "inventory", "toModule": "inventory", "fromModel": "variant", "fromModule": "product"}	2026-09-05 12:43:54.910147
15	product_variant_price_set	{"toModel": "price_set", "toModule": "pricing", "fromModel": "variant", "fromModule": "product"}	2026-09-05 12:43:54.953833
16	publishable_api_key_sales_channel	{"toModel": "sales_channel", "toModule": "sales_channel", "fromModel": "api_key", "fromModule": "api_key"}	2026-09-05 12:43:54.997858
17	region_payment_provider	{"toModel": "payment_provider", "toModule": "payment", "fromModel": "region", "fromModule": "region"}	2026-09-05 12:43:55.039197
18	sales_channel_stock_location	{"toModel": "location", "toModule": "stock_location", "fromModel": "sales_channel", "fromModule": "sales_channel"}	2026-09-05 12:43:55.083895
19	shipping_option_price_set	{"toModel": "price_set", "toModule": "pricing", "fromModel": "shipping_option", "fromModule": "fulfillment"}	2026-09-05 12:43:55.126585
20	user_rbac_role	{"toModel": "rbac_role", "toModule": "rbac", "fromModel": "user", "fromModule": "user"}	2026-09-05 12:43:55.166806
\.


--
-- Data for Name: location_fulfillment_provider; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.location_fulfillment_provider (stock_location_id, fulfillment_provider_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: location_fulfillment_set; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.location_fulfillment_set (stock_location_id, fulfillment_set_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: mikro_orm_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mikro_orm_migrations (id, name, executed_at) FROM stdin;
1	Migration20240307161216	2026-09-05 12:43:11.497372-05
2	Migration20241210073813	2026-09-05 12:43:11.497372-05
3	Migration20250106142624	2026-09-05 12:43:11.497372-05
4	Migration20250120110820	2026-09-05 12:43:11.497372-05
5	Migration20240307132720	2026-09-05 12:43:12.977213-05
6	Migration20240719123015	2026-09-05 12:43:12.977213-05
7	Migration20241213063611	2026-09-05 12:43:12.977213-05
8	Migration20251010131115	2026-09-05 12:43:12.977213-05
9	InitialSetup20240401153642	2026-09-05 12:43:16.352169-05
10	Migration20240601111544	2026-09-05 12:43:16.352169-05
11	Migration202408271511	2026-09-05 12:43:16.352169-05
12	Migration20241122120331	2026-09-05 12:43:16.352169-05
13	Migration20241125090957	2026-09-05 12:43:16.352169-05
14	Migration20250411073236	2026-09-05 12:43:16.352169-05
15	Migration20250516081326	2026-09-05 12:43:16.352169-05
16	Migration20250910154539	2026-09-05 12:43:16.352169-05
17	Migration20250911092221	2026-09-05 12:43:16.352169-05
18	Migration20250929204438	2026-09-05 12:43:16.352169-05
19	Migration20251008132218	2026-09-05 12:43:16.352169-05
20	Migration20251011090511	2026-09-05 12:43:16.352169-05
21	Migration20251022153442	2026-09-05 12:43:16.352169-05
22	Migration20251029150809	2026-09-05 12:43:16.352169-05
23	Migration20251110180907	2026-09-05 12:43:16.352169-05
24	Migration20251113183352	2026-09-05 12:43:16.352169-05
25	Migration20260224120000	2026-09-05 12:43:16.352169-05
26	Migration20260301002050	2026-09-05 12:43:16.352169-05
27	Migration20260306120000	2026-09-05 12:43:16.352169-05
28	Migration20260623180000	2026-09-05 12:43:16.352169-05
29	Migration20230929122253	2026-09-05 12:43:21.462301-05
30	Migration20240322094407	2026-09-05 12:43:21.462301-05
31	Migration20240322113359	2026-09-05 12:43:21.462301-05
32	Migration20240322120125	2026-09-05 12:43:21.462301-05
33	Migration20240626133555	2026-09-05 12:43:21.462301-05
34	Migration20240704094505	2026-09-05 12:43:21.462301-05
35	Migration20241127114534	2026-09-05 12:43:21.462301-05
36	Migration20241127223829	2026-09-05 12:43:21.462301-05
37	Migration20241128055359	2026-09-05 12:43:21.462301-05
38	Migration20241212190401	2026-09-05 12:43:21.462301-05
39	Migration20250408145122	2026-09-05 12:43:21.462301-05
40	Migration20250409122219	2026-09-05 12:43:21.462301-05
41	Migration20251009110625	2026-09-05 12:43:21.462301-05
42	Migration20251112192723	2026-09-05 12:43:21.462301-05
43	Migration20260429163502	2026-09-05 12:43:21.462301-05
44	Migration20240227120221	2026-09-05 12:43:24.753775-05
45	Migration20240617102917	2026-09-05 12:43:24.753775-05
46	Migration20240624153824	2026-09-05 12:43:24.753775-05
47	Migration20241211061114	2026-09-05 12:43:24.753775-05
48	Migration20250113094144	2026-09-05 12:43:24.753775-05
49	Migration20250120110700	2026-09-05 12:43:24.753775-05
50	Migration20250226130616	2026-09-05 12:43:24.753775-05
51	Migration20250508081510	2026-09-05 12:43:24.753775-05
52	Migration20250828075407	2026-09-05 12:43:24.753775-05
53	Migration20250909083125	2026-09-05 12:43:24.753775-05
54	Migration20250916120552	2026-09-05 12:43:24.753775-05
55	Migration20250917143818	2026-09-05 12:43:24.753775-05
56	Migration20250919122137	2026-09-05 12:43:24.753775-05
57	Migration20251006000000	2026-09-05 12:43:24.753775-05
58	Migration20251015113934	2026-09-05 12:43:24.753775-05
59	Migration20251107050148	2026-09-05 12:43:24.753775-05
60	Migration20240124154000	2026-09-05 12:43:27.139344-05
61	Migration20240524123112	2026-09-05 12:43:27.139344-05
62	Migration20240602110946	2026-09-05 12:43:27.139344-05
63	Migration20241211074630	2026-09-05 12:43:27.139344-05
64	Migration20251010130829	2026-09-05 12:43:27.139344-05
65	Migration20240115152146	2026-09-05 12:43:28.135146-05
66	Migration20240222170223	2026-09-05 12:43:28.658228-05
67	Migration20240831125857	2026-09-05 12:43:28.658228-05
68	Migration20241106085918	2026-09-05 12:43:28.658228-05
69	Migration20241205095237	2026-09-05 12:43:28.658228-05
70	Migration20241216183049	2026-09-05 12:43:28.658228-05
71	Migration20241218091938	2026-09-05 12:43:28.658228-05
72	Migration20250120115059	2026-09-05 12:43:28.658228-05
73	Migration20250212131240	2026-09-05 12:43:28.658228-05
74	Migration20250326151602	2026-09-05 12:43:28.658228-05
75	Migration20250508081553	2026-09-05 12:43:28.658228-05
76	Migration20251017153909	2026-09-05 12:43:28.658228-05
77	Migration20251208130704	2026-09-05 12:43:28.658228-05
78	Migration20260626000000	2026-09-05 12:43:28.658228-05
79	Migration20240205173216	2026-09-05 12:43:30.457859-05
80	Migration20240624200006	2026-09-05 12:43:30.457859-05
81	Migration20250120110744	2026-09-05 12:43:30.457859-05
82	InitialSetup20240221144943	2026-09-05 12:43:31.345595-05
83	Migration20240604080145	2026-09-05 12:43:31.345595-05
84	Migration20241205122700	2026-09-05 12:43:31.345595-05
85	Migration20251015123842	2026-09-05 12:43:31.345595-05
86	InitialSetup20240227075933	2026-09-05 12:43:32.852718-05
87	Migration20240621145944	2026-09-05 12:43:32.852718-05
88	Migration20241206083313	2026-09-05 12:43:32.852718-05
89	Migration20251202184737	2026-09-05 12:43:32.852718-05
90	Migration20251212161429	2026-09-05 12:43:32.852718-05
91	Migration20240227090331	2026-09-05 12:43:34.661102-05
92	Migration20240710135844	2026-09-05 12:43:34.661102-05
93	Migration20240924114005	2026-09-05 12:43:34.661102-05
94	Migration20241212052837	2026-09-05 12:43:34.661102-05
95	InitialSetup20240228133303	2026-09-05 12:43:35.902481-05
96	Migration20240624082354	2026-09-05 12:43:35.902481-05
97	Migration20240225134525	2026-09-05 12:43:36.61862-05
98	Migration20240806072619	2026-09-05 12:43:36.61862-05
99	Migration20241211151053	2026-09-05 12:43:36.61862-05
100	Migration20250115160517	2026-09-05 12:43:36.61862-05
101	Migration20250120110552	2026-09-05 12:43:36.61862-05
102	Migration20250123122334	2026-09-05 12:43:36.61862-05
103	Migration20250206105639	2026-09-05 12:43:36.61862-05
104	Migration20250207132723	2026-09-05 12:43:36.61862-05
105	Migration20250625084134	2026-09-05 12:43:36.61862-05
106	Migration20250924135437	2026-09-05 12:43:36.61862-05
107	Migration20250929124701	2026-09-05 12:43:36.61862-05
108	Migration20260411223700	2026-09-05 12:43:36.61862-05
109	Migration20240219102530	2026-09-05 12:43:38.271418-05
110	Migration20240604100512	2026-09-05 12:43:38.271418-05
111	Migration20240715102100	2026-09-05 12:43:38.271418-05
112	Migration20240715174100	2026-09-05 12:43:38.271418-05
113	Migration20240716081800	2026-09-05 12:43:38.271418-05
114	Migration20240801085921	2026-09-05 12:43:38.271418-05
115	Migration20240821164505	2026-09-05 12:43:38.271418-05
116	Migration20240821170920	2026-09-05 12:43:38.271418-05
117	Migration20240827133639	2026-09-05 12:43:38.271418-05
118	Migration20240902195921	2026-09-05 12:43:38.271418-05
119	Migration20240913092514	2026-09-05 12:43:38.271418-05
120	Migration20240930122627	2026-09-05 12:43:38.271418-05
121	Migration20241014142943	2026-09-05 12:43:38.271418-05
122	Migration20241106085223	2026-09-05 12:43:38.271418-05
123	Migration20241129124827	2026-09-05 12:43:38.271418-05
124	Migration20241217162224	2026-09-05 12:43:38.271418-05
125	Migration20250326151554	2026-09-05 12:43:38.271418-05
126	Migration20250522181137	2026-09-05 12:43:38.271418-05
127	Migration20250702095353	2026-09-05 12:43:38.271418-05
128	Migration20250704120229	2026-09-05 12:43:38.271418-05
129	Migration20250910130000	2026-09-05 12:43:38.271418-05
130	Migration20251016160403	2026-09-05 12:43:38.271418-05
131	Migration20251016182939	2026-09-05 12:43:38.271418-05
132	Migration20251017155709	2026-09-05 12:43:38.271418-05
133	Migration20251114100559	2026-09-05 12:43:38.271418-05
134	Migration20251125164002	2026-09-05 12:43:38.271418-05
135	Migration20251210112909	2026-09-05 12:43:38.271418-05
136	Migration20251210112924	2026-09-05 12:43:38.271418-05
137	Migration20251225120947	2026-09-05 12:43:38.271418-05
138	Migration20260106185528	2026-09-05 12:43:38.271418-05
139	Migration20260625000000	2026-09-05 12:43:38.271418-05
140	Migration20250717162007	2026-09-05 12:43:43.918029-05
141	Migration20260127081758	2026-09-05 12:43:43.918029-05
142	Migration20260615151246	2026-09-05 12:43:43.918029-05
143	Migration20240205025928	2026-09-05 12:43:44.780911-05
144	Migration20240529080336	2026-09-05 12:43:44.780911-05
145	Migration20241202100304	2026-09-05 12:43:44.780911-05
146	Migration20260514083900	2026-09-05 12:43:44.780911-05
147	Migration20260525090000	2026-09-05 12:43:44.780911-05
148	Migration20260604120000	2026-09-05 12:43:44.780911-05
149	Migration20260616075929	2026-09-05 12:43:44.780911-05
150	Migration20240214033943	2026-09-05 12:43:47.521123-05
151	Migration20240703095850	2026-09-05 12:43:47.521123-05
152	Migration20241202103352	2026-09-05 12:43:47.521123-05
153	Migration20240311145700_InitialSetupMigration	2026-09-05 12:43:48.181908-05
154	Migration20240821170957	2026-09-05 12:43:48.181908-05
155	Migration20240917161003	2026-09-05 12:43:48.181908-05
156	Migration20241217110416	2026-09-05 12:43:48.181908-05
157	Migration20250113122235	2026-09-05 12:43:48.181908-05
158	Migration20250120115002	2026-09-05 12:43:48.181908-05
159	Migration20250822130931	2026-09-05 12:43:48.181908-05
160	Migration20250825132614	2026-09-05 12:43:48.181908-05
161	Migration20251114133146	2026-09-05 12:43:48.181908-05
162	Migration20240509083918_InitialSetupMigration	2026-09-05 12:43:49.975543-05
163	Migration20240628075401	2026-09-05 12:43:49.975543-05
164	Migration20240830094712	2026-09-05 12:43:49.975543-05
165	Migration20250120110514	2026-09-05 12:43:49.975543-05
166	Migration20251028172715	2026-09-05 12:43:49.975543-05
167	Migration20251121123942	2026-09-05 12:43:49.975543-05
168	Migration20251121150408	2026-09-05 12:43:49.975543-05
169	Migration20231228143900	2026-09-05 12:43:51.452148-05
170	Migration20241206101446	2026-09-05 12:43:51.452148-05
171	Migration20250128174331	2026-09-05 12:43:51.452148-05
172	Migration20250505092459	2026-09-05 12:43:51.452148-05
173	Migration20250819104213	2026-09-05 12:43:51.452148-05
174	Migration20250819110924	2026-09-05 12:43:51.452148-05
175	Migration20250908080305	2026-09-05 12:43:51.452148-05
176	Migration20260905174656	2026-09-05 12:48:43.827951-05
177	Migration20260905174715	2026-09-05 12:48:44.513868-05
178	Migration20260905174736	2026-09-05 12:48:45.045204-05
179	Migration20260905174757	2026-09-05 12:48:45.59191-05
180	Migration20260905174758	2026-09-05 12:48:46.169287-05
181	Migration20260905183605	2026-09-05 13:36:43.137413-05
182	Migration20260908213525	2026-09-12 10:11:56.168677-05
183	Migration20260912151022	2026-09-12 10:12:14.063052-05
\.


--
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification (id, "to", channel, template, data, trigger_type, resource_id, resource_type, receiver_id, original_notification_id, idempotency_key, external_id, provider_id, created_at, updated_at, deleted_at, status, "from", provider_data) FROM stdin;
\.


--
-- Data for Name: notification_provider; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_provider (id, handle, name, is_enabled, channels, created_at, updated_at, deleted_at) FROM stdin;
local	local	local	t	{feed}	2026-09-05 12:44:15.336-05	2026-09-05 12:44:15.336-05	\N
\.


--
-- Data for Name: order; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."order" (id, region_id, display_id, customer_id, version, sales_channel_id, status, is_draft_order, email, currency_code, shipping_address_id, billing_address_id, no_notification, metadata, created_at, updated_at, deleted_at, canceled_at, custom_display_id, locale) FROM stdin;
\.


--
-- Data for Name: order_address; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_address (id, customer_id, company, first_name, last_name, address_1, address_2, city, country_code, province, postal_code, phone, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: order_cart; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_cart (order_id, cart_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: order_change; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_change (id, order_id, version, description, status, internal_note, created_by, requested_by, requested_at, confirmed_by, confirmed_at, declined_by, declined_reason, metadata, declined_at, canceled_by, canceled_at, created_at, updated_at, change_type, deleted_at, return_id, claim_id, exchange_id, carry_over_promotions) FROM stdin;
\.


--
-- Data for Name: order_change_action; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_change_action (id, order_id, version, ordering, order_change_id, reference, reference_id, action, details, amount, raw_amount, internal_note, applied, created_at, updated_at, deleted_at, return_id, claim_id, exchange_id) FROM stdin;
\.


--
-- Data for Name: order_claim; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_claim (id, order_id, return_id, order_version, display_id, type, no_notification, refund_amount, raw_refund_amount, metadata, created_at, updated_at, deleted_at, canceled_at, created_by) FROM stdin;
\.


--
-- Data for Name: order_claim_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_claim_item (id, claim_id, item_id, is_additional_item, reason, quantity, raw_quantity, note, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: order_claim_item_image; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_claim_item_image (id, claim_item_id, url, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: order_credit_line; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_credit_line (id, order_id, reference, reference_id, amount, raw_amount, metadata, created_at, updated_at, deleted_at, version) FROM stdin;
\.


--
-- Data for Name: order_exchange; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_exchange (id, order_id, return_id, order_version, display_id, no_notification, allow_backorder, difference_due, raw_difference_due, metadata, created_at, updated_at, deleted_at, canceled_at, created_by) FROM stdin;
\.


--
-- Data for Name: order_exchange_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_exchange_item (id, exchange_id, item_id, quantity, raw_quantity, note, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: order_fulfillment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_fulfillment (order_id, fulfillment_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: order_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_item (id, order_id, version, item_id, quantity, raw_quantity, fulfilled_quantity, raw_fulfilled_quantity, shipped_quantity, raw_shipped_quantity, return_requested_quantity, raw_return_requested_quantity, return_received_quantity, raw_return_received_quantity, return_dismissed_quantity, raw_return_dismissed_quantity, written_off_quantity, raw_written_off_quantity, metadata, created_at, updated_at, deleted_at, delivered_quantity, raw_delivered_quantity, unit_price, raw_unit_price, compare_at_unit_price, raw_compare_at_unit_price) FROM stdin;
\.


--
-- Data for Name: order_line_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_line_item (id, totals_id, title, subtitle, thumbnail, variant_id, product_id, product_title, product_description, product_subtitle, product_type, product_collection, product_handle, variant_sku, variant_barcode, variant_title, variant_option_values, requires_shipping, is_discountable, is_tax_inclusive, compare_at_unit_price, raw_compare_at_unit_price, unit_price, raw_unit_price, metadata, created_at, updated_at, deleted_at, is_custom_price, product_type_id, is_giftcard) FROM stdin;
\.


--
-- Data for Name: order_line_item_adjustment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_line_item_adjustment (id, description, promotion_id, code, amount, raw_amount, provider_id, created_at, updated_at, item_id, deleted_at, is_tax_inclusive, version) FROM stdin;
\.


--
-- Data for Name: order_line_item_tax_line; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_line_item_tax_line (id, description, tax_rate_id, code, rate, raw_rate, provider_id, created_at, updated_at, item_id, deleted_at, metadata, data) FROM stdin;
\.


--
-- Data for Name: order_payment_collection; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_payment_collection (order_id, payment_collection_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: order_promotion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_promotion (order_id, promotion_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: order_shipping; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_shipping (id, order_id, version, shipping_method_id, created_at, updated_at, deleted_at, return_id, claim_id, exchange_id) FROM stdin;
\.


--
-- Data for Name: order_shipping_method; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_shipping_method (id, name, description, amount, raw_amount, is_tax_inclusive, shipping_option_id, data, metadata, created_at, updated_at, deleted_at, is_custom_amount) FROM stdin;
\.


--
-- Data for Name: order_shipping_method_adjustment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_shipping_method_adjustment (id, description, promotion_id, code, amount, raw_amount, provider_id, created_at, updated_at, shipping_method_id, deleted_at, version) FROM stdin;
\.


--
-- Data for Name: order_shipping_method_tax_line; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_shipping_method_tax_line (id, description, tax_rate_id, code, rate, raw_rate, provider_id, created_at, updated_at, shipping_method_id, deleted_at, metadata, data) FROM stdin;
\.


--
-- Data for Name: order_summary; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_summary (id, order_id, version, totals, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: order_transaction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_transaction (id, order_id, version, amount, raw_amount, currency_code, reference, reference_id, created_at, updated_at, deleted_at, return_id, claim_id, exchange_id) FROM stdin;
\.


--
-- Data for Name: password_reset_otp; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_reset_otp (id, email, code, expires_at, created_at, attempts) FROM stdin;
6	carlos.admin@pianocolombia.com	177667	2026-09-09 13:37:17.263-05	2026-09-09 13:27:17.269547-05	1
\.


--
-- Data for Name: payment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment (id, amount, raw_amount, currency_code, provider_id, data, created_at, updated_at, deleted_at, captured_at, canceled_at, payment_collection_id, payment_session_id, metadata) FROM stdin;
\.


--
-- Data for Name: payment_collection; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_collection (id, currency_code, amount, raw_amount, authorized_amount, raw_authorized_amount, captured_amount, raw_captured_amount, refunded_amount, raw_refunded_amount, created_at, updated_at, deleted_at, completed_at, status, metadata) FROM stdin;
\.


--
-- Data for Name: payment_collection_payment_providers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_collection_payment_providers (payment_collection_id, payment_provider_id) FROM stdin;
\.


--
-- Data for Name: payment_provider; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_provider (id, is_enabled, created_at, updated_at, deleted_at) FROM stdin;
pp_system_default	t	2026-09-05 12:44:15.329-05	2026-09-05 12:44:15.329-05	\N
\.


--
-- Data for Name: payment_session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_session (id, currency_code, amount, raw_amount, provider_id, data, context, status, authorized_at, payment_collection_id, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: payout_batch; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payout_batch (id, batch_number, period_start, period_end, status, total_gross_cop, total_commission_pc_cop, total_net_composers_cop, wompi_batch_id, executed_at, executed_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: payout_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payout_item (id, composer_id, composer_name, bank_name, account_type, account_number, document_number, amount_gross_cop, commission_pc_cop, amount_net_cop, wompi_transfer_id, status, error_message, batch_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: platform_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.platform_settings (key, value, updated_at) FROM stdin;
default_commission_percentage	15	2026-09-08 16:43:06.043227
catalog_difficulties	[{"id":"diff_1","code":"BEGINNER","title_es":"Principiante (Nivel 1 - 3)","title_en":"Beginner (Level 1 - 3)","status":"VISIBLE"},{"id":"diff_2","code":"INTERMEDIATE","title_es":"Intermedio (Nivel 4 - 6)","title_en":"Intermediate (Level 4 - 6)","status":"VISIBLE"},{"id":"diff_3","code":"ADVANCED","title_es":"Avanzado (Nivel 7 - 8)","title_en":"Advanced (Level 7 - 8)","status":"VISIBLE"},{"id":"diff_4","code":"VIRTUOSO","title_es":"Virtuoso / Concierto","title_en":"Virtuoso / Concert","status":"VISIBLE"}]	2026-09-09 18:48:43.083635
home_featured_composers	[{"id":"historico","name":"Patrimonio Histórico","icon":"piano","composer_ids":["01M1SB1H6H5MJYYJ1BME04GSV9","01M1SB1H84VC58PYFDGPMSD637"]},{"id":"contemporaneo","name":"Contemporáneos","icon":"music_note","composer_ids":["01M219P4DT4NMGJMRTJWKGX4NA"]},{"id":"mujeres","name":"Mujeres Compositoras","icon":"star","composer_ids":[]}]	2026-09-16 19:28:28.648937
home_categories	[{"id":"cat_piano_solo","title":"Piano Solo","slug":"piano-solo","description":"Obras maestras para recital, concurso y profundización técnica individual. Pasillos virtuosos, bambucos de concierto e intermezzos líricos.","icon":"piano","cta_text":"Explorar piezas solistas","link":"/tienda?categoria=piano-solo","is_active":true,"order":1,"count_unit":"Obras","count_unit_singular":"Obra","matching_genres":["Piano Solo","PASILLO","CLASICO","BAMBUCO","DANZA","VALS","Pasillo","Bambuco","Danza"]},{"id":"cat_piano_4_manos","title":"Piano a 4 Manos","slug":"piano-a-4-manos","description":"Dúos concertantes y reducciones orquestales a cuatro manos. Ideal para cátedras de música de cámara y recitales colaborativos a dos intérpretes.","icon":"group","cta_text":"Ver dúos de piano","link":"/tienda?categoria=piano-a-4-manos","is_active":true,"order":2,"count_unit":"Obras","count_unit_singular":"Obra","matching_genres":["Piano a 4 Manos","Piano 4 Manos","4 Manos"]},{"id":"cat_piano_orquesta","title":"Piano y Orquesta","slug":"piano-y-orquesta","description":"Partituras de dirección, guiones generales y reducciones a segundo piano de conciertos para piano y orquesta sinfónica colombiana. son las mejores de todas","icon":"stadium","cta_text":"Catálogo orquestal","link":"/tienda?categoria=piano-y-orquesta","is_active":true,"order":3,"count_unit":"Conciertos","count_unit_singular":"Concierto","matching_genres":["Piano y Orquesta","Orquesta","Concierto"]},{"id":"cat_musica_camara","title":"Música de Cámara","slug":"musica-de-camara","description":"Tríos con violín y violonchelo, sonatas para instrumentos solistas con acompañamiento de piano y ensambles folclóricos de cámara.","icon":"diversity_3","cta_text":"Explorar cámara","link":"/tienda?categoria=musica-de-camara","is_active":true,"order":4,"count_unit":"Partituras","count_unit_singular":"Partitura","matching_genres":["Música de Cámara","Cámara","Trío","Cuarteto"]},{"id":"cat_piezas_pedagogicas","title":"Piezas Pedagógicas","slug":"piezas-pedagogicas","description":"Metodologías progresivas, iniciación al teclado y repertorio graduado por niveles (Preparatorio al Nivel 6) con canciones tradicionales colombianas.","icon":"school","cta_text":"Ver repertorio didáctico","link":"/tienda?categoria=piezas-pedagogicas","is_active":true,"order":5,"count_unit":"Cuadernos","count_unit_singular":"Cuaderno","matching_genres":["Piezas Pedagógicas","Pedagógico","Método","Estudio","Iniciación"]},{"id":"cat_piano_electronica","title":"Piano y Electrónica","slug":"piano-y-electronica","description":"Vanguardia contemporánea, obras para piano preparado con cinta magnética, procesamiento digital en vivo (Max/MSP) y paisajes bio-acústicos.","icon":"graphic_eq","cta_text":"Explorar vanguardia","link":"/tienda?categoria=piano-y-electronica","is_active":true,"order":6,"count_unit":"Obras","count_unit_singular":"Obra","matching_genres":["Piano y Electrónica","Electrónica","Electroacústico","Vanguardia"]}]	2026-09-12 12:42:11.061108
catalog_categories	[{"id":"cat_piano_solo","slug":"piano-solo","title_es":"Piano Solo","title_en":"Piano Solo","status":"VISIBLE"},{"id":"cat_piano_4_manos","slug":"piano-a-4-manos","title_es":"Piano a 4 Manos","title_en":"Piano a 4 Manos","status":"VISIBLE"},{"id":"cat_piano_orquesta","slug":"piano-y-orquesta","title_es":"Piano y Orquesta","title_en":"Piano y Orquesta","status":"VISIBLE"},{"id":"cat_musica_camara","slug":"musica-de-camara","title_es":"Música de Cámara","title_en":"Música de Cámara","status":"VISIBLE"},{"id":"cat_piezas_pedagogicas","slug":"piezas-pedagogicas","title_es":"Piezas Pedagógicas","title_en":"Piezas Pedagógicas","status":"VISIBLE"},{"id":"cat_piano_electronica","slug":"piano-y-electronica","title_es":"Piano y Electrónica","title_en":"Piano y Electrónica","status":"VISIBLE"}]	2026-09-12 12:42:11.092684
\.


--
-- Data for Name: price; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.price (id, title, price_set_id, currency_code, raw_amount, rules_count, created_at, updated_at, deleted_at, price_list_id, amount, min_quantity, max_quantity, raw_min_quantity, raw_max_quantity) FROM stdin;
\.


--
-- Data for Name: price_list; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.price_list (id, status, starts_at, ends_at, rules_count, title, description, type, created_at, updated_at, deleted_at, metadata) FROM stdin;
\.


--
-- Data for Name: price_list_rule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.price_list_rule (id, price_list_id, created_at, updated_at, deleted_at, value, attribute) FROM stdin;
\.


--
-- Data for Name: price_preference; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.price_preference (id, attribute, value, is_tax_inclusive, created_at, updated_at, deleted_at) FROM stdin;
prpref_01M1SAV2RAP8TMCDAWAARE61Q2	currency_code	eur	f	2026-09-05 12:46:11.083-05	2026-09-05 12:46:11.083-05	\N
\.


--
-- Data for Name: price_rule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.price_rule (id, value, priority, price_id, created_at, updated_at, deleted_at, attribute, operator) FROM stdin;
\.


--
-- Data for Name: price_set; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.price_set (id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product (id, title, handle, subtitle, description, is_giftcard, status, thumbnail, weight, length, height, width, origin_country, hs_code, mid_code, material, collection_id, type_id, discountable, external_id, created_at, updated_at, deleted_at, metadata) FROM stdin;
\.


--
-- Data for Name: product_category; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_category (id, name, description, handle, mpath, is_active, is_internal, rank, parent_category_id, created_at, updated_at, deleted_at, metadata, external_id) FROM stdin;
\.


--
-- Data for Name: product_category_product; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_category_product (product_id, product_category_id) FROM stdin;
\.


--
-- Data for Name: product_collection; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_collection (id, title, handle, metadata, created_at, updated_at, deleted_at, external_id) FROM stdin;
\.


--
-- Data for Name: product_option; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_option (id, title, metadata, created_at, updated_at, deleted_at, is_exclusive) FROM stdin;
\.


--
-- Data for Name: product_option_value; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_option_value (id, value, option_id, metadata, created_at, updated_at, deleted_at, rank) FROM stdin;
\.


--
-- Data for Name: product_product_option; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_product_option (id, product_id, product_option_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: product_product_option_value; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_product_option_value (id, product_product_option_id, product_option_value_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: product_sales_channel; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_sales_channel (product_id, sales_channel_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: product_shipping_profile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_shipping_profile (product_id, shipping_profile_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: product_tag; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_tag (id, value, metadata, created_at, updated_at, deleted_at, external_id) FROM stdin;
\.


--
-- Data for Name: product_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_tags (product_id, product_tag_id) FROM stdin;
\.


--
-- Data for Name: product_type; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_type (id, value, metadata, created_at, updated_at, deleted_at, external_id) FROM stdin;
\.


--
-- Data for Name: product_variant; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_variant (id, title, sku, barcode, ean, upc, allow_backorder, manage_inventory, hs_code, origin_country, mid_code, material, weight, length, height, width, metadata, variant_rank, product_id, created_at, updated_at, deleted_at, thumbnail) FROM stdin;
\.


--
-- Data for Name: product_variant_inventory_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_variant_inventory_item (variant_id, inventory_item_id, id, required_quantity, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: product_variant_option; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_variant_option (variant_id, option_value_id) FROM stdin;
\.


--
-- Data for Name: product_variant_price_set; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_variant_price_set (variant_id, price_set_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: product_variant_product_image; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_variant_product_image (id, variant_id, image_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: promotion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.promotion (id, code, campaign_id, is_automatic, type, created_at, updated_at, deleted_at, status, is_tax_inclusive, "limit", used, metadata) FROM stdin;
\.


--
-- Data for Name: promotion_application_method; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.promotion_application_method (id, value, raw_value, max_quantity, apply_to_quantity, buy_rules_min_quantity, type, target_type, allocation, promotion_id, created_at, updated_at, deleted_at, currency_code) FROM stdin;
\.


--
-- Data for Name: promotion_campaign; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.promotion_campaign (id, name, description, campaign_identifier, starts_at, ends_at, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: promotion_campaign_budget; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.promotion_campaign_budget (id, type, campaign_id, "limit", raw_limit, used, raw_used, created_at, updated_at, deleted_at, currency_code, attribute) FROM stdin;
\.


--
-- Data for Name: promotion_campaign_budget_usage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.promotion_campaign_budget_usage (id, attribute_value, used, budget_id, raw_used, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: promotion_promotion_rule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.promotion_promotion_rule (promotion_id, promotion_rule_id) FROM stdin;
\.


--
-- Data for Name: promotion_rule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.promotion_rule (id, description, attribute, operator, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: promotion_rule_value; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.promotion_rule_value (id, promotion_rule_id, value, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: property_label; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.property_label (id, entity, property, label, description, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: provider_identity; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.provider_identity (id, entity_id, provider, auth_identity_id, user_metadata, provider_metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: publishable_api_key_sales_channel; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.publishable_api_key_sales_channel (publishable_key_id, sales_channel_id, id, created_at, updated_at, deleted_at) FROM stdin;
apk_01M1SAV2SHCJ8CE1X1Y7CZNC2C	sc_01M1SAV2NTCM874CP3A86YZ499	pksc_01M1SAV2T859AKNPFXX8D3JRBN	2026-09-05 12:46:11.143618-05	2026-09-05 12:46:11.143618-05	\N
\.


--
-- Data for Name: refund; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.refund (id, amount, raw_amount, payment_id, created_at, updated_at, deleted_at, created_by, metadata, refund_reason_id, note) FROM stdin;
\.


--
-- Data for Name: refund_reason; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.refund_reason (id, label, description, metadata, created_at, updated_at, deleted_at, code) FROM stdin;
refr_01M1SAPD5RM1D8X3CXK4HJSZGW	Shipping Issue	Refund due to lost, delayed, or misdelivered shipment	\N	2026-09-05 12:43:36.61862-05	2026-09-05 12:43:36.61862-05	\N	shipping_issue
refr_01M1SAPD5ZKK3EKMZXRZ5SSEWA	Customer Care Adjustment	Refund given as goodwill or compensation for inconvenience	\N	2026-09-05 12:43:36.61862-05	2026-09-05 12:43:36.61862-05	\N	customer_care_adjustment
refr_01M1SAPD5ZPE2EH0ZYKZGADN5H	Pricing Error	Refund to correct an overcharge, missing discount, or incorrect price	\N	2026-09-05 12:43:36.61862-05	2026-09-05 12:43:36.61862-05	\N	pricing_error
\.


--
-- Data for Name: region; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.region (id, name, currency_code, metadata, created_at, updated_at, deleted_at, automatic_taxes) FROM stdin;
\.


--
-- Data for Name: region_country; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.region_country (iso_2, iso_3, num_code, name, display_name, region_id, metadata, created_at, updated_at, deleted_at) FROM stdin;
af	afg	004	AFGHANISTAN	Afghanistan	\N	\N	2026-09-05 12:44:15.242-05	2026-09-05 12:44:15.242-05	\N
al	alb	008	ALBANIA	Albania	\N	\N	2026-09-05 12:44:15.243-05	2026-09-05 12:44:15.243-05	\N
dz	dza	012	ALGERIA	Algeria	\N	\N	2026-09-05 12:44:15.243-05	2026-09-05 12:44:15.243-05	\N
as	asm	016	AMERICAN SAMOA	American Samoa	\N	\N	2026-09-05 12:44:15.243-05	2026-09-05 12:44:15.243-05	\N
ad	and	020	ANDORRA	Andorra	\N	\N	2026-09-05 12:44:15.244-05	2026-09-05 12:44:15.244-05	\N
ao	ago	024	ANGOLA	Angola	\N	\N	2026-09-05 12:44:15.244-05	2026-09-05 12:44:15.244-05	\N
ai	aia	660	ANGUILLA	Anguilla	\N	\N	2026-09-05 12:44:15.244-05	2026-09-05 12:44:15.244-05	\N
aq	ata	010	ANTARCTICA	Antarctica	\N	\N	2026-09-05 12:44:15.244-05	2026-09-05 12:44:15.244-05	\N
ag	atg	028	ANTIGUA AND BARBUDA	Antigua and Barbuda	\N	\N	2026-09-05 12:44:15.244-05	2026-09-05 12:44:15.244-05	\N
ar	arg	032	ARGENTINA	Argentina	\N	\N	2026-09-05 12:44:15.244-05	2026-09-05 12:44:15.244-05	\N
am	arm	051	ARMENIA	Armenia	\N	\N	2026-09-05 12:44:15.244-05	2026-09-05 12:44:15.244-05	\N
aw	abw	533	ARUBA	Aruba	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
au	aus	036	AUSTRALIA	Australia	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
at	aut	040	AUSTRIA	Austria	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
az	aze	031	AZERBAIJAN	Azerbaijan	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
bs	bhs	044	BAHAMAS	Bahamas	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
bh	bhr	048	BAHRAIN	Bahrain	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
bd	bgd	050	BANGLADESH	Bangladesh	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
bb	brb	052	BARBADOS	Barbados	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
by	blr	112	BELARUS	Belarus	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
be	bel	056	BELGIUM	Belgium	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
bz	blz	084	BELIZE	Belize	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
bj	ben	204	BENIN	Benin	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
bm	bmu	060	BERMUDA	Bermuda	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
bt	btn	064	BHUTAN	Bhutan	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
bo	bol	068	BOLIVIA	Bolivia	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
bq	bes	535	BONAIRE, SINT EUSTATIUS AND SABA	Bonaire, Sint Eustatius and Saba	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
ba	bih	070	BOSNIA AND HERZEGOVINA	Bosnia and Herzegovina	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
bw	bwa	072	BOTSWANA	Botswana	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
bv	bvd	074	BOUVET ISLAND	Bouvet Island	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
br	bra	076	BRAZIL	Brazil	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
io	iot	086	BRITISH INDIAN OCEAN TERRITORY	British Indian Ocean Territory	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
bn	brn	096	BRUNEI DARUSSALAM	Brunei Darussalam	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
bg	bgr	100	BULGARIA	Bulgaria	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
bf	bfa	854	BURKINA FASO	Burkina Faso	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
bi	bdi	108	BURUNDI	Burundi	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
kh	khm	116	CAMBODIA	Cambodia	\N	\N	2026-09-05 12:44:15.245-05	2026-09-05 12:44:15.245-05	\N
cm	cmr	120	CAMEROON	Cameroon	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
ca	can	124	CANADA	Canada	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
cv	cpv	132	CAPE VERDE	Cape Verde	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
ky	cym	136	CAYMAN ISLANDS	Cayman Islands	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
cf	caf	140	CENTRAL AFRICAN REPUBLIC	Central African Republic	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
td	tcd	148	CHAD	Chad	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
cl	chl	152	CHILE	Chile	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
cn	chn	156	CHINA	China	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
cx	cxr	162	CHRISTMAS ISLAND	Christmas Island	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
cc	cck	166	COCOS (KEELING) ISLANDS	Cocos (Keeling) Islands	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
co	col	170	COLOMBIA	Colombia	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
km	com	174	COMOROS	Comoros	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
cg	cog	178	CONGO	Congo	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
cd	cod	180	CONGO, THE DEMOCRATIC REPUBLIC OF THE	Congo, the Democratic Republic of the	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
ck	cok	184	COOK ISLANDS	Cook Islands	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
cr	cri	188	COSTA RICA	Costa Rica	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
ci	civ	384	COTE D'IVOIRE	Cote D'Ivoire	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
hr	hrv	191	CROATIA	Croatia	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
cu	cub	192	CUBA	Cuba	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
cw	cuw	531	CURAÇAO	Curaçao	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
cy	cyp	196	CYPRUS	Cyprus	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
cz	cze	203	CZECH REPUBLIC	Czech Republic	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
dk	dnk	208	DENMARK	Denmark	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
dj	dji	262	DJIBOUTI	Djibouti	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
dm	dma	212	DOMINICA	Dominica	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
do	dom	214	DOMINICAN REPUBLIC	Dominican Republic	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
ec	ecu	218	ECUADOR	Ecuador	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
eg	egy	818	EGYPT	Egypt	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
sv	slv	222	EL SALVADOR	El Salvador	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
gq	gnq	226	EQUATORIAL GUINEA	Equatorial Guinea	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
er	eri	232	ERITREA	Eritrea	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
ee	est	233	ESTONIA	Estonia	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
et	eth	231	ETHIOPIA	Ethiopia	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
fk	flk	238	FALKLAND ISLANDS (MALVINAS)	Falkland Islands (Malvinas)	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
fo	fro	234	FAROE ISLANDS	Faroe Islands	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
fj	fji	242	FIJI	Fiji	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
fi	fin	246	FINLAND	Finland	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
fr	fra	250	FRANCE	France	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
gf	guf	254	FRENCH GUIANA	French Guiana	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
pf	pyf	258	FRENCH POLYNESIA	French Polynesia	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
tf	atf	260	FRENCH SOUTHERN TERRITORIES	French Southern Territories	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
ga	gab	266	GABON	Gabon	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
gm	gmb	270	GAMBIA	Gambia	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
ge	geo	268	GEORGIA	Georgia	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
de	deu	276	GERMANY	Germany	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
gh	gha	288	GHANA	Ghana	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
gi	gib	292	GIBRALTAR	Gibraltar	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
gr	grc	300	GREECE	Greece	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
gl	grl	304	GREENLAND	Greenland	\N	\N	2026-09-05 12:44:15.246-05	2026-09-05 12:44:15.246-05	\N
gd	grd	308	GRENADA	Grenada	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
gp	glp	312	GUADELOUPE	Guadeloupe	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
gu	gum	316	GUAM	Guam	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
gt	gtm	320	GUATEMALA	Guatemala	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
gg	ggy	831	GUERNSEY	Guernsey	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
gn	gin	324	GUINEA	Guinea	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
gw	gnb	624	GUINEA-BISSAU	Guinea-Bissau	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
gy	guy	328	GUYANA	Guyana	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
ht	hti	332	HAITI	Haiti	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
hm	hmd	334	HEARD ISLAND AND MCDONALD ISLANDS	Heard Island And Mcdonald Islands	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
va	vat	336	HOLY SEE (VATICAN CITY STATE)	Holy See (Vatican City State)	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
hn	hnd	340	HONDURAS	Honduras	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
hk	hkg	344	HONG KONG	Hong Kong	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
hu	hun	348	HUNGARY	Hungary	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
is	isl	352	ICELAND	Iceland	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
in	ind	356	INDIA	India	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
id	idn	360	INDONESIA	Indonesia	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
ir	irn	364	IRAN, ISLAMIC REPUBLIC OF	Iran, Islamic Republic of	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
iq	irq	368	IRAQ	Iraq	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
ie	irl	372	IRELAND	Ireland	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
im	imn	833	ISLE OF MAN	Isle Of Man	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
il	isr	376	ISRAEL	Israel	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
it	ita	380	ITALY	Italy	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
jm	jam	388	JAMAICA	Jamaica	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
jp	jpn	392	JAPAN	Japan	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
je	jey	832	JERSEY	Jersey	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
jo	jor	400	JORDAN	Jordan	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
kz	kaz	398	KAZAKHSTAN	Kazakhstan	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
ke	ken	404	KENYA	Kenya	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
ki	kir	296	KIRIBATI	Kiribati	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
kp	prk	408	KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF	Korea, Democratic People's Republic of	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
kr	kor	410	KOREA, REPUBLIC OF	Korea, Republic of	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
xk	xkx	900	KOSOVO	Kosovo	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
kw	kwt	414	KUWAIT	Kuwait	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
kg	kgz	417	KYRGYZSTAN	Kyrgyzstan	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
la	lao	418	LAO PEOPLE'S DEMOCRATIC REPUBLIC	Lao People's Democratic Republic	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
lv	lva	428	LATVIA	Latvia	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
lb	lbn	422	LEBANON	Lebanon	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
ls	lso	426	LESOTHO	Lesotho	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
lr	lbr	430	LIBERIA	Liberia	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
ly	lby	434	LIBYA	Libya	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
li	lie	438	LIECHTENSTEIN	Liechtenstein	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
lt	ltu	440	LITHUANIA	Lithuania	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
lu	lux	442	LUXEMBOURG	Luxembourg	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
mo	mac	446	MACAO	Macao	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
mg	mdg	450	MADAGASCAR	Madagascar	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
mw	mwi	454	MALAWI	Malawi	\N	\N	2026-09-05 12:44:15.247-05	2026-09-05 12:44:15.247-05	\N
my	mys	458	MALAYSIA	Malaysia	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
mv	mdv	462	MALDIVES	Maldives	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
ml	mli	466	MALI	Mali	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
mt	mlt	470	MALTA	Malta	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
mh	mhl	584	MARSHALL ISLANDS	Marshall Islands	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
mq	mtq	474	MARTINIQUE	Martinique	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
mr	mrt	478	MAURITANIA	Mauritania	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
mu	mus	480	MAURITIUS	Mauritius	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
yt	myt	175	MAYOTTE	Mayotte	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
mx	mex	484	MEXICO	Mexico	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
fm	fsm	583	MICRONESIA, FEDERATED STATES OF	Micronesia, Federated States of	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
md	mda	498	MOLDOVA, REPUBLIC OF	Moldova, Republic of	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
mc	mco	492	MONACO	Monaco	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
mn	mng	496	MONGOLIA	Mongolia	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
me	mne	499	MONTENEGRO	Montenegro	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
ms	msr	500	MONTSERRAT	Montserrat	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
ma	mar	504	MOROCCO	Morocco	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
mz	moz	508	MOZAMBIQUE	Mozambique	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
mm	mmr	104	MYANMAR	Myanmar	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
na	nam	516	NAMIBIA	Namibia	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
nr	nru	520	NAURU	Nauru	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
np	npl	524	NEPAL	Nepal	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
nl	nld	528	NETHERLANDS	Netherlands	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
nc	ncl	540	NEW CALEDONIA	New Caledonia	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
nz	nzl	554	NEW ZEALAND	New Zealand	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
ni	nic	558	NICARAGUA	Nicaragua	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
ne	ner	562	NIGER	Niger	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
ng	nga	566	NIGERIA	Nigeria	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
nu	niu	570	NIUE	Niue	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
nf	nfk	574	NORFOLK ISLAND	Norfolk Island	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
mk	mkd	807	NORTH MACEDONIA	North Macedonia	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
mp	mnp	580	NORTHERN MARIANA ISLANDS	Northern Mariana Islands	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
no	nor	578	NORWAY	Norway	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
om	omn	512	OMAN	Oman	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
pk	pak	586	PAKISTAN	Pakistan	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
pw	plw	585	PALAU	Palau	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
ps	pse	275	PALESTINIAN TERRITORY, OCCUPIED	Palestinian Territory, Occupied	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
pa	pan	591	PANAMA	Panama	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
pg	png	598	PAPUA NEW GUINEA	Papua New Guinea	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
py	pry	600	PARAGUAY	Paraguay	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
pe	per	604	PERU	Peru	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
ph	phl	608	PHILIPPINES	Philippines	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
pn	pcn	612	PITCAIRN	Pitcairn	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
pl	pol	616	POLAND	Poland	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
pt	prt	620	PORTUGAL	Portugal	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
pr	pri	630	PUERTO RICO	Puerto Rico	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
qa	qat	634	QATAR	Qatar	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
re	reu	638	REUNION	Reunion	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
ro	rom	642	ROMANIA	Romania	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
ru	rus	643	RUSSIAN FEDERATION	Russian Federation	\N	\N	2026-09-05 12:44:15.248-05	2026-09-05 12:44:15.248-05	\N
rw	rwa	646	RWANDA	Rwanda	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
bl	blm	652	SAINT BARTHÉLEMY	Saint Barthélemy	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
sh	shn	654	SAINT HELENA	Saint Helena	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
kn	kna	659	SAINT KITTS AND NEVIS	Saint Kitts and Nevis	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
lc	lca	662	SAINT LUCIA	Saint Lucia	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
mf	maf	663	SAINT MARTIN (FRENCH PART)	Saint Martin (French part)	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
pm	spm	666	SAINT PIERRE AND MIQUELON	Saint Pierre and Miquelon	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
vc	vct	670	SAINT VINCENT AND THE GRENADINES	Saint Vincent and the Grenadines	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
ws	wsm	882	SAMOA	Samoa	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
sm	smr	674	SAN MARINO	San Marino	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
st	stp	678	SAO TOME AND PRINCIPE	Sao Tome and Principe	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
sa	sau	682	SAUDI ARABIA	Saudi Arabia	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
sn	sen	686	SENEGAL	Senegal	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
rs	srb	688	SERBIA	Serbia	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
sc	syc	690	SEYCHELLES	Seychelles	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
sl	sle	694	SIERRA LEONE	Sierra Leone	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
sg	sgp	702	SINGAPORE	Singapore	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
sx	sxm	534	SINT MAARTEN	Sint Maarten	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
sk	svk	703	SLOVAKIA	Slovakia	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
si	svn	705	SLOVENIA	Slovenia	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
sb	slb	090	SOLOMON ISLANDS	Solomon Islands	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
so	som	706	SOMALIA	Somalia	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
za	zaf	710	SOUTH AFRICA	South Africa	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
gs	sgs	239	SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS	South Georgia and the South Sandwich Islands	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
ss	ssd	728	SOUTH SUDAN	South Sudan	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
es	esp	724	SPAIN	Spain	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
lk	lka	144	SRI LANKA	Sri Lanka	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
sd	sdn	729	SUDAN	Sudan	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
sr	sur	740	SURINAME	Suriname	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
sj	sjm	744	SVALBARD AND JAN MAYEN	Svalbard and Jan Mayen	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
sz	swz	748	SWAZILAND	Swaziland	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
se	swe	752	SWEDEN	Sweden	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
ch	che	756	SWITZERLAND	Switzerland	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
sy	syr	760	SYRIAN ARAB REPUBLIC	Syrian Arab Republic	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
tw	twn	158	TAIWAN, PROVINCE OF CHINA	Taiwan, Province of China	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
tj	tjk	762	TAJIKISTAN	Tajikistan	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
tz	tza	834	TANZANIA, UNITED REPUBLIC OF	Tanzania, United Republic of	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
th	tha	764	THAILAND	Thailand	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
tl	tls	626	TIMOR LESTE	Timor Leste	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
tg	tgo	768	TOGO	Togo	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
tk	tkl	772	TOKELAU	Tokelau	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
to	ton	776	TONGA	Tonga	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
tt	tto	780	TRINIDAD AND TOBAGO	Trinidad and Tobago	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
tn	tun	788	TUNISIA	Tunisia	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
tr	tur	792	TURKEY	Turkey	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
tm	tkm	795	TURKMENISTAN	Turkmenistan	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
tc	tca	796	TURKS AND CAICOS ISLANDS	Turks and Caicos Islands	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
tv	tuv	798	TUVALU	Tuvalu	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
ug	uga	800	UGANDA	Uganda	\N	\N	2026-09-05 12:44:15.249-05	2026-09-05 12:44:15.249-05	\N
ua	ukr	804	UKRAINE	Ukraine	\N	\N	2026-09-05 12:44:15.25-05	2026-09-05 12:44:15.25-05	\N
ae	are	784	UNITED ARAB EMIRATES	United Arab Emirates	\N	\N	2026-09-05 12:44:15.25-05	2026-09-05 12:44:15.25-05	\N
gb	gbr	826	UNITED KINGDOM	United Kingdom	\N	\N	2026-09-05 12:44:15.25-05	2026-09-05 12:44:15.25-05	\N
us	usa	840	UNITED STATES	United States	\N	\N	2026-09-05 12:44:15.25-05	2026-09-05 12:44:15.25-05	\N
um	umi	581	UNITED STATES MINOR OUTLYING ISLANDS	United States Minor Outlying Islands	\N	\N	2026-09-05 12:44:15.25-05	2026-09-05 12:44:15.25-05	\N
uy	ury	858	URUGUAY	Uruguay	\N	\N	2026-09-05 12:44:15.25-05	2026-09-05 12:44:15.25-05	\N
uz	uzb	860	UZBEKISTAN	Uzbekistan	\N	\N	2026-09-05 12:44:15.25-05	2026-09-05 12:44:15.25-05	\N
vu	vut	548	VANUATU	Vanuatu	\N	\N	2026-09-05 12:44:15.25-05	2026-09-05 12:44:15.25-05	\N
ve	ven	862	VENEZUELA	Venezuela	\N	\N	2026-09-05 12:44:15.25-05	2026-09-05 12:44:15.25-05	\N
vn	vnm	704	VIET NAM	Viet Nam	\N	\N	2026-09-05 12:44:15.25-05	2026-09-05 12:44:15.25-05	\N
vg	vgb	092	VIRGIN ISLANDS, BRITISH	Virgin Islands, British	\N	\N	2026-09-05 12:44:15.25-05	2026-09-05 12:44:15.25-05	\N
vi	vir	850	VIRGIN ISLANDS, U.S.	Virgin Islands, U.S.	\N	\N	2026-09-05 12:44:15.25-05	2026-09-05 12:44:15.25-05	\N
wf	wlf	876	WALLIS AND FUTUNA	Wallis and Futuna	\N	\N	2026-09-05 12:44:15.25-05	2026-09-05 12:44:15.25-05	\N
eh	esh	732	WESTERN SAHARA	Western Sahara	\N	\N	2026-09-05 12:44:15.25-05	2026-09-05 12:44:15.25-05	\N
ye	yem	887	YEMEN	Yemen	\N	\N	2026-09-05 12:44:15.25-05	2026-09-05 12:44:15.25-05	\N
zm	zmb	894	ZAMBIA	Zambia	\N	\N	2026-09-05 12:44:15.25-05	2026-09-05 12:44:15.25-05	\N
zw	zwe	716	ZIMBABWE	Zimbabwe	\N	\N	2026-09-05 12:44:15.25-05	2026-09-05 12:44:15.25-05	\N
ax	ala	248	ÅLAND ISLANDS	Åland Islands	\N	\N	2026-09-05 12:44:15.25-05	2026-09-05 12:44:15.25-05	\N
\.


--
-- Data for Name: region_payment_provider; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.region_payment_provider (region_id, payment_provider_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: reservation_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reservation_item (id, created_at, updated_at, deleted_at, line_item_id, location_id, quantity, external_id, description, created_by, metadata, inventory_item_id, allow_backorder, raw_quantity) FROM stdin;
\.


--
-- Data for Name: return; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.return (id, order_id, claim_id, exchange_id, order_version, display_id, status, no_notification, refund_amount, raw_refund_amount, metadata, created_at, updated_at, deleted_at, received_at, canceled_at, location_id, requested_at, created_by) FROM stdin;
\.


--
-- Data for Name: return_fulfillment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.return_fulfillment (return_id, fulfillment_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: return_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.return_item (id, return_id, reason_id, item_id, quantity, raw_quantity, received_quantity, raw_received_quantity, note, metadata, created_at, updated_at, deleted_at, damaged_quantity, raw_damaged_quantity) FROM stdin;
\.


--
-- Data for Name: return_reason; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.return_reason (id, value, label, description, metadata, parent_return_reason_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: sales_channel; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales_channel (id, name, description, is_disabled, metadata, created_at, updated_at, deleted_at) FROM stdin;
sc_01M1SAV2NTCM874CP3A86YZ499	Default Sales Channel	Created by Medusa	f	\N	2026-09-05 12:46:11.003-05	2026-09-05 12:46:11.003-05	\N
\.


--
-- Data for Name: sales_channel_stock_location; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales_channel_stock_location (sales_channel_id, stock_location_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: score; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.score (id, title, slug, composer_id, genre, difficulty, description_es, description_en, pages_count, duration_approx, year_composition, tonality, price_cop, price_usd, status, rejection_notes, original_pdf_url, preview_pdf_url, audio_sample_url, is_featured, product_id, created_at, updated_at, deleted_at, preview_images) FROM stdin;
01M1SB1H7EG434CVNPB4G60C4N	Pasillo Colombiano No. 1 en Mi Menor	pasillo-colombiano-no-1	01M1SB1H6H5MJYYJ1BME04GSV9	PASILLO	INTERMEDIO	Obra maestra del nacionalismo impresionista colombiano con síncopas características andinas.	A benchmark work of Colombian musical impressionism with distinct syncopated rhythms.	4	3:30	1938	Mi Menor	35000	850	APPROVED	\N	/pdf/master/mejia-pasillo-1-master.pdf	/pdf/previews/mejia-pasillo-1.pdf	\N	t	\N	2026-09-05 12:49:42.511-05	2026-09-05 12:49:42.511-05	\N	[]
01M1SB1H8G3A5860J88HR78QDH	Intermezzo No. 1 - Lejano Azul	intermezzo-no-1-lejano-azul	01M1SB1H84VC58PYFDGPMSD637	CLASICO	AVANZADO	La cumbre del lirismo romántico para piano en Colombia.	The pinnacle of Colombian romantic piano literature.	6	4:45	1915	Si Bemol Mayor	45000	1100	APPROVED	\N	/pdf/master/calvo-lejano-azul-master.pdf	/pdf/previews/calvo-lejano-azul.pdf	\N	t	\N	2026-09-05 12:49:42.544-05	2026-09-05 12:49:42.544-05	\N	[]
01M1SB1H9DG8ZRGSFR2SZ35QM9	Bambuco en Re Mayor 'El Fusagasugueño'	bambuco-el-fusagasugueno	01M1SB1H8ZMDQB2MWW5PX689KN	BAMBUCO	INTERMEDIO	Tradicional bambuco de salón con refinada polirritmia de 6/8 contra 3/4.	A refined salon bambuco featuring traditional 6/8 vs 3/4 polyrhythms.	5	3:15	1898	Re Mayor	38000	900	APPROVED	\N	/pdf/master/morales-bambuco-master.pdf	/pdf/previews/morales-bambuco.pdf	\N	t	\N	2026-09-05 12:49:42.573-05	2026-09-05 12:49:42.573-05	\N	[]
01M2633R6236W4Y2XMKV80N2X3	Prueba Score Node	prueba-score-node-159	01M1SB1H6H5MJYYJ1BME04GSV9	Pasillo	INTERMEDIATE	\N	\N	4	\N	\N	Mi menor	40000	12	IN_REVIEW	\N	/master-scores/prueba-score-node-159-master.pdf	/preview-scores/prueba-score-node-159.pdf	\N	f	\N	2026-09-10 11:41:14.18-05	2026-09-10 11:41:14.18-05	\N	[]
01M263KVQ347H7G6VWJ327X56G	Obertura-Fantasía Romeo	obertura-fantasia-romeo-438	01M219P4DT4NMGJMRTJWKGX4NA	Piano a 4 Manos	Intermedio (Nivel 4 - 6)	La partitura de la Obertura-Fantasía Romeo y Julieta de Piotr Ilich Chaikovski es una obra maestra programática estructurada en forma sonata libre, concebida para una gran orquesta romántica donde los contrastes tímbricos y dinámicos narran directamente la tragedia de William Shakespeare: inicia con un solemne y reflexivo coral en vientos de madera que encarna a Fray Lorenzo, estalla súbitamente en ritmos sincopados y feroces choques de percusión y metales que ilustran el violento enfrentamiento entre Montescos y Capuletos, y se eleva hacia uno de los pasajes líricos más célebres de la historia de la música a través de un desgarrador tema de amor introducido por el corno inglés y las violas con sordina, para finalmente resolverse en una marcha fúnebre de timbales que transmuta el dolor trágico en una conmovedora redención en Si mayor.	\N	43	\N	\N	Re mayor	40000	13	APPROVED	\N	http://localhost:9000/media?key=master-scores%2F1789070061858-tchaik-romeo1.pdf-filename-romeo-and-juliet-overture-fantasia-complete-score.pdf	http://localhost:9000/media?key=master-scores%2F1789070061858-tchaik-romeo1.pdf-filename-romeo-and-juliet-overture-fantasia-complete-score.pdf	https://www.youtube.com/watch?v=1zfOh6gESNg&list=PL3PBjtE_N_aTh0x_-4_ZDaZ2zJTxXN87z&index=1	f	\N	2026-09-10 11:50:02.085-05	2026-09-10 14:56:27.518-05	\N	["http://localhost:9000/media?key=previews%2F1789070063634-preview-page-1-1789070063607.png", "http://localhost:9000/media?key=previews%2F1789070064427-preview-page-2-1789070064397.png", "http://localhost:9000/media?key=previews%2F1789070065305-preview-page-3-1789070065279.png"]
\.


--
-- Data for Name: script_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.script_migrations (id, script_name, created_at, finished_at) FROM stdin;
1	migrate-normalize-currency-codes-normalization.js	2026-09-05 12:44:16.796933-05	2026-09-05 12:44:17.020266-05
2	migrate-product-option-link-ids.js	2026-09-05 12:44:17.064317-05	2026-09-05 12:44:17.089666-05
3	migrate-product-shipping-profile.js	2026-09-05 12:45:08.337855-05	2026-09-05 12:45:08.732571-05
4	migrate-tax-region-provider.js	2026-09-05 12:45:08.78059-05	2026-09-05 12:45:08.821652-05
5	reconcile-inventory-reserved-quantity.js	2026-09-05 12:45:08.87093-05	2026-09-05 12:45:08.91444-05
\.


--
-- Data for Name: service_zone; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_zone (id, name, metadata, fulfillment_set_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: shipping_option; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shipping_option (id, name, price_type, service_zone_id, shipping_profile_id, provider_id, data, metadata, shipping_option_type_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: shipping_option_price_set; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shipping_option_price_set (shipping_option_id, price_set_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: shipping_option_rule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shipping_option_rule (id, attribute, operator, value, shipping_option_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: shipping_option_type; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shipping_option_type (id, label, description, code, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: shipping_profile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shipping_profile (id, name, type, metadata, created_at, updated_at, deleted_at) FROM stdin;
sp_01M1SAS5V7RYCP5K5FK3P731YQ	Default Shipping Profile	default	\N	2026-09-05 12:45:08.711-05	2026-09-05 12:45:08.711-05	\N
\.


--
-- Data for Name: stock_location; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_location (id, created_at, updated_at, deleted_at, name, address_id, metadata) FROM stdin;
\.


--
-- Data for Name: stock_location_address; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_location_address (id, created_at, updated_at, deleted_at, address_1, address_2, company, city, country_code, phone, province, postal_code, metadata) FROM stdin;
\.


--
-- Data for Name: store; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.store (id, name, default_sales_channel_id, default_region_id, default_location_id, metadata, created_at, updated_at, deleted_at) FROM stdin;
store_01M1SAV2PXRDVE2FN91CV7H04F	Medusa Store	sc_01M1SAV2NTCM874CP3A86YZ499	\N	\N	\N	2026-09-05 12:46:11.034007-05	2026-09-05 12:46:11.034007-05	\N
\.


--
-- Data for Name: store_currency; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.store_currency (id, currency_code, is_default, store_id, created_at, updated_at, deleted_at) FROM stdin;
stocur_01M1SAV2QAVXERBGTJPW06K0NG	eur	t	store_01M1SAV2PXRDVE2FN91CV7H04F	2026-09-05 12:46:11.034007-05	2026-09-05 12:46:11.034007-05	\N
\.


--
-- Data for Name: store_locale; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.store_locale (id, locale_code, store_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: tax_provider; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tax_provider (id, is_enabled, created_at, updated_at, deleted_at) FROM stdin;
tp_system	t	2026-09-05 12:44:15.322-05	2026-09-05 12:44:15.322-05	\N
\.


--
-- Data for Name: tax_rate; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tax_rate (id, rate, code, name, is_default, is_combinable, tax_region_id, metadata, created_at, updated_at, created_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: tax_rate_rule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tax_rate_rule (id, tax_rate_id, reference_id, reference, metadata, created_at, updated_at, created_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: tax_region; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tax_region (id, provider_id, country_code, province_code, parent_id, metadata, created_at, updated_at, created_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."user" (id, first_name, last_name, email, avatar_url, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: user_preference; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_preference (id, user_id, key, value, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: user_rbac_role; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_rbac_role (user_id, rbac_role_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: view_configuration; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.view_configuration (id, entity, name, user_id, is_system_default, configuration, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: workflow_execution; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.workflow_execution (id, workflow_id, transaction_id, execution, context, state, created_at, updated_at, deleted_at, retention_time, run_id) FROM stdin;
\.


--
-- Name: link_module_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.link_module_migrations_id_seq', 140, true);


--
-- Name: mikro_orm_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mikro_orm_migrations_id_seq', 183, true);


--
-- Name: order_change_action_ordering_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_change_action_ordering_seq', 1, false);


--
-- Name: order_claim_display_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_claim_display_id_seq', 1, false);


--
-- Name: order_display_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_display_id_seq', 1, false);


--
-- Name: order_exchange_display_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_exchange_display_id_seq', 1, false);


--
-- Name: password_reset_otp_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.password_reset_otp_id_seq', 7, true);


--
-- Name: return_display_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.return_display_id_seq', 1, false);


--
-- Name: script_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.script_migrations_id_seq', 5, true);


--
-- Name: account_holder account_holder_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_holder
    ADD CONSTRAINT account_holder_pkey PRIMARY KEY (id);


--
-- Name: admin_user admin_user_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_user
    ADD CONSTRAINT admin_user_email_key UNIQUE (email);


--
-- Name: admin_user admin_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_user
    ADD CONSTRAINT admin_user_pkey PRIMARY KEY (id);


--
-- Name: api_key api_key_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_key
    ADD CONSTRAINT api_key_pkey PRIMARY KEY (id);


--
-- Name: application_method_buy_rules application_method_buy_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_method_buy_rules
    ADD CONSTRAINT application_method_buy_rules_pkey PRIMARY KEY (application_method_id, promotion_rule_id);


--
-- Name: application_method_target_rules application_method_target_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_method_target_rules
    ADD CONSTRAINT application_method_target_rules_pkey PRIMARY KEY (application_method_id, promotion_rule_id);


--
-- Name: auth_identity auth_identity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_identity
    ADD CONSTRAINT auth_identity_pkey PRIMARY KEY (id);


--
-- Name: auth_mfa_factor auth_mfa_factor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_mfa_factor
    ADD CONSTRAINT auth_mfa_factor_pkey PRIMARY KEY (id);


--
-- Name: auth_mfa_recovery_code auth_mfa_recovery_code_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_mfa_recovery_code
    ADD CONSTRAINT auth_mfa_recovery_code_pkey PRIMARY KEY (id);


--
-- Name: auth_password_reset_token auth_password_reset_token_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_password_reset_token
    ADD CONSTRAINT auth_password_reset_token_pkey PRIMARY KEY (id);


--
-- Name: auth_verification auth_verification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_verification
    ADD CONSTRAINT auth_verification_pkey PRIMARY KEY (id);


--
-- Name: capture capture_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capture
    ADD CONSTRAINT capture_pkey PRIMARY KEY (id);


--
-- Name: cart_address cart_address_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_address
    ADD CONSTRAINT cart_address_pkey PRIMARY KEY (id);


--
-- Name: cart_line_item_adjustment cart_line_item_adjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_line_item_adjustment
    ADD CONSTRAINT cart_line_item_adjustment_pkey PRIMARY KEY (id);


--
-- Name: cart_line_item cart_line_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_line_item
    ADD CONSTRAINT cart_line_item_pkey PRIMARY KEY (id);


--
-- Name: cart_line_item_tax_line cart_line_item_tax_line_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_line_item_tax_line
    ADD CONSTRAINT cart_line_item_tax_line_pkey PRIMARY KEY (id);


--
-- Name: cart_payment_collection cart_payment_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_payment_collection
    ADD CONSTRAINT cart_payment_collection_pkey PRIMARY KEY (cart_id, payment_collection_id);


--
-- Name: cart cart_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY (id);


--
-- Name: cart_promotion cart_promotion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_promotion
    ADD CONSTRAINT cart_promotion_pkey PRIMARY KEY (cart_id, promotion_id);


--
-- Name: cart_shipping_method_adjustment cart_shipping_method_adjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_shipping_method_adjustment
    ADD CONSTRAINT cart_shipping_method_adjustment_pkey PRIMARY KEY (id);


--
-- Name: cart_shipping_method cart_shipping_method_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_shipping_method
    ADD CONSTRAINT cart_shipping_method_pkey PRIMARY KEY (id);


--
-- Name: cart_shipping_method_tax_line cart_shipping_method_tax_line_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_shipping_method_tax_line
    ADD CONSTRAINT cart_shipping_method_tax_line_pkey PRIMARY KEY (id);


--
-- Name: composer_bank_account composer_bank_account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.composer_bank_account
    ADD CONSTRAINT composer_bank_account_pkey PRIMARY KEY (id);


--
-- Name: composer composer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.composer
    ADD CONSTRAINT composer_pkey PRIMARY KEY (id);


--
-- Name: credit_line credit_line_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_line
    ADD CONSTRAINT credit_line_pkey PRIMARY KEY (id);


--
-- Name: currency currency_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.currency
    ADD CONSTRAINT currency_pkey PRIMARY KEY (code);


--
-- Name: customer_account_holder customer_account_holder_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_account_holder
    ADD CONSTRAINT customer_account_holder_pkey PRIMARY KEY (customer_id, account_holder_id);


--
-- Name: customer_account customer_account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_account
    ADD CONSTRAINT customer_account_pkey PRIMARY KEY (id);


--
-- Name: customer_address customer_address_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_address
    ADD CONSTRAINT customer_address_pkey PRIMARY KEY (id);


--
-- Name: customer_download customer_download_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_download
    ADD CONSTRAINT customer_download_pkey PRIMARY KEY (id);


--
-- Name: customer_group_customer customer_group_customer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_group_customer
    ADD CONSTRAINT customer_group_customer_pkey PRIMARY KEY (id);


--
-- Name: customer_group customer_group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_group
    ADD CONSTRAINT customer_group_pkey PRIMARY KEY (id);


--
-- Name: customer customer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_pkey PRIMARY KEY (id);


--
-- Name: fulfillment_address fulfillment_address_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fulfillment_address
    ADD CONSTRAINT fulfillment_address_pkey PRIMARY KEY (id);


--
-- Name: fulfillment_item fulfillment_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fulfillment_item
    ADD CONSTRAINT fulfillment_item_pkey PRIMARY KEY (id);


--
-- Name: fulfillment_label fulfillment_label_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fulfillment_label
    ADD CONSTRAINT fulfillment_label_pkey PRIMARY KEY (id);


--
-- Name: fulfillment fulfillment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fulfillment
    ADD CONSTRAINT fulfillment_pkey PRIMARY KEY (id);


--
-- Name: fulfillment_provider fulfillment_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fulfillment_provider
    ADD CONSTRAINT fulfillment_provider_pkey PRIMARY KEY (id);


--
-- Name: fulfillment_set fulfillment_set_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fulfillment_set
    ADD CONSTRAINT fulfillment_set_pkey PRIMARY KEY (id);


--
-- Name: geo_zone geo_zone_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.geo_zone
    ADD CONSTRAINT geo_zone_pkey PRIMARY KEY (id);


--
-- Name: hero_content hero_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hero_content
    ADD CONSTRAINT hero_content_pkey PRIMARY KEY (id);


--
-- Name: image image_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_pkey PRIMARY KEY (id);


--
-- Name: inventory_item inventory_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_item
    ADD CONSTRAINT inventory_item_pkey PRIMARY KEY (id);


--
-- Name: inventory_level inventory_level_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_level
    ADD CONSTRAINT inventory_level_pkey PRIMARY KEY (id);


--
-- Name: invite invite_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invite
    ADD CONSTRAINT invite_pkey PRIMARY KEY (id);


--
-- Name: invite_rbac_role invite_rbac_role_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invite_rbac_role
    ADD CONSTRAINT invite_rbac_role_pkey PRIMARY KEY (invite_id, rbac_role_id);


--
-- Name: layout_configuration layout_configuration_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.layout_configuration
    ADD CONSTRAINT layout_configuration_pkey PRIMARY KEY (id);


--
-- Name: link_module_migrations link_module_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.link_module_migrations
    ADD CONSTRAINT link_module_migrations_pkey PRIMARY KEY (id);


--
-- Name: link_module_migrations link_module_migrations_table_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.link_module_migrations
    ADD CONSTRAINT link_module_migrations_table_name_key UNIQUE (table_name);


--
-- Name: location_fulfillment_provider location_fulfillment_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location_fulfillment_provider
    ADD CONSTRAINT location_fulfillment_provider_pkey PRIMARY KEY (stock_location_id, fulfillment_provider_id);


--
-- Name: location_fulfillment_set location_fulfillment_set_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location_fulfillment_set
    ADD CONSTRAINT location_fulfillment_set_pkey PRIMARY KEY (stock_location_id, fulfillment_set_id);


--
-- Name: mikro_orm_migrations mikro_orm_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mikro_orm_migrations
    ADD CONSTRAINT mikro_orm_migrations_pkey PRIMARY KEY (id);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- Name: notification_provider notification_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_provider
    ADD CONSTRAINT notification_provider_pkey PRIMARY KEY (id);


--
-- Name: order_address order_address_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_address
    ADD CONSTRAINT order_address_pkey PRIMARY KEY (id);


--
-- Name: order_cart order_cart_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_cart
    ADD CONSTRAINT order_cart_pkey PRIMARY KEY (order_id, cart_id);


--
-- Name: order_change_action order_change_action_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_change_action
    ADD CONSTRAINT order_change_action_pkey PRIMARY KEY (id);


--
-- Name: order_change order_change_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_change
    ADD CONSTRAINT order_change_pkey PRIMARY KEY (id);


--
-- Name: order_claim_item_image order_claim_item_image_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_claim_item_image
    ADD CONSTRAINT order_claim_item_image_pkey PRIMARY KEY (id);


--
-- Name: order_claim_item order_claim_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_claim_item
    ADD CONSTRAINT order_claim_item_pkey PRIMARY KEY (id);


--
-- Name: order_claim order_claim_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_claim
    ADD CONSTRAINT order_claim_pkey PRIMARY KEY (id);


--
-- Name: order_credit_line order_credit_line_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_credit_line
    ADD CONSTRAINT order_credit_line_pkey PRIMARY KEY (id);


--
-- Name: order_exchange_item order_exchange_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_exchange_item
    ADD CONSTRAINT order_exchange_item_pkey PRIMARY KEY (id);


--
-- Name: order_exchange order_exchange_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_exchange
    ADD CONSTRAINT order_exchange_pkey PRIMARY KEY (id);


--
-- Name: order_fulfillment order_fulfillment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_fulfillment
    ADD CONSTRAINT order_fulfillment_pkey PRIMARY KEY (order_id, fulfillment_id);


--
-- Name: order_item order_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_pkey PRIMARY KEY (id);


--
-- Name: order_line_item_adjustment order_line_item_adjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_line_item_adjustment
    ADD CONSTRAINT order_line_item_adjustment_pkey PRIMARY KEY (id);


--
-- Name: order_line_item order_line_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_line_item
    ADD CONSTRAINT order_line_item_pkey PRIMARY KEY (id);


--
-- Name: order_line_item_tax_line order_line_item_tax_line_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_line_item_tax_line
    ADD CONSTRAINT order_line_item_tax_line_pkey PRIMARY KEY (id);


--
-- Name: order_payment_collection order_payment_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_payment_collection
    ADD CONSTRAINT order_payment_collection_pkey PRIMARY KEY (order_id, payment_collection_id);


--
-- Name: order order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_pkey PRIMARY KEY (id);


--
-- Name: order_promotion order_promotion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_promotion
    ADD CONSTRAINT order_promotion_pkey PRIMARY KEY (order_id, promotion_id);


--
-- Name: order_shipping_method_adjustment order_shipping_method_adjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_shipping_method_adjustment
    ADD CONSTRAINT order_shipping_method_adjustment_pkey PRIMARY KEY (id);


--
-- Name: order_shipping_method order_shipping_method_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_shipping_method
    ADD CONSTRAINT order_shipping_method_pkey PRIMARY KEY (id);


--
-- Name: order_shipping_method_tax_line order_shipping_method_tax_line_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_shipping_method_tax_line
    ADD CONSTRAINT order_shipping_method_tax_line_pkey PRIMARY KEY (id);


--
-- Name: order_shipping order_shipping_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_shipping
    ADD CONSTRAINT order_shipping_pkey PRIMARY KEY (id);


--
-- Name: order_summary order_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_summary
    ADD CONSTRAINT order_summary_pkey PRIMARY KEY (id);


--
-- Name: order_transaction order_transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_transaction
    ADD CONSTRAINT order_transaction_pkey PRIMARY KEY (id);


--
-- Name: password_reset_otp password_reset_otp_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_otp
    ADD CONSTRAINT password_reset_otp_pkey PRIMARY KEY (id);


--
-- Name: payment_collection_payment_providers payment_collection_payment_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_collection_payment_providers
    ADD CONSTRAINT payment_collection_payment_providers_pkey PRIMARY KEY (payment_collection_id, payment_provider_id);


--
-- Name: payment_collection payment_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_collection
    ADD CONSTRAINT payment_collection_pkey PRIMARY KEY (id);


--
-- Name: payment payment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_pkey PRIMARY KEY (id);


--
-- Name: payment_provider payment_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_provider
    ADD CONSTRAINT payment_provider_pkey PRIMARY KEY (id);


--
-- Name: payment_session payment_session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_session
    ADD CONSTRAINT payment_session_pkey PRIMARY KEY (id);


--
-- Name: payout_batch payout_batch_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payout_batch
    ADD CONSTRAINT payout_batch_pkey PRIMARY KEY (id);


--
-- Name: payout_item payout_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payout_item
    ADD CONSTRAINT payout_item_pkey PRIMARY KEY (id);


--
-- Name: platform_settings platform_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT platform_settings_pkey PRIMARY KEY (key);


--
-- Name: price_list price_list_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_list
    ADD CONSTRAINT price_list_pkey PRIMARY KEY (id);


--
-- Name: price_list_rule price_list_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_list_rule
    ADD CONSTRAINT price_list_rule_pkey PRIMARY KEY (id);


--
-- Name: price price_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price
    ADD CONSTRAINT price_pkey PRIMARY KEY (id);


--
-- Name: price_preference price_preference_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_preference
    ADD CONSTRAINT price_preference_pkey PRIMARY KEY (id);


--
-- Name: price_rule price_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_rule
    ADD CONSTRAINT price_rule_pkey PRIMARY KEY (id);


--
-- Name: price_set price_set_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_set
    ADD CONSTRAINT price_set_pkey PRIMARY KEY (id);


--
-- Name: product_category product_category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_category
    ADD CONSTRAINT product_category_pkey PRIMARY KEY (id);


--
-- Name: product_category_product product_category_product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_category_product
    ADD CONSTRAINT product_category_product_pkey PRIMARY KEY (product_id, product_category_id);


--
-- Name: product_collection product_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_collection
    ADD CONSTRAINT product_collection_pkey PRIMARY KEY (id);


--
-- Name: product_option product_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_option
    ADD CONSTRAINT product_option_pkey PRIMARY KEY (id);


--
-- Name: product_option_value product_option_value_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_option_value
    ADD CONSTRAINT product_option_value_pkey PRIMARY KEY (id);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- Name: product_product_option product_product_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_product_option
    ADD CONSTRAINT product_product_option_pkey PRIMARY KEY (id);


--
-- Name: product_product_option_value product_product_option_value_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_product_option_value
    ADD CONSTRAINT product_product_option_value_pkey PRIMARY KEY (id);


--
-- Name: product_sales_channel product_sales_channel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_sales_channel
    ADD CONSTRAINT product_sales_channel_pkey PRIMARY KEY (product_id, sales_channel_id);


--
-- Name: product_shipping_profile product_shipping_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_shipping_profile
    ADD CONSTRAINT product_shipping_profile_pkey PRIMARY KEY (product_id, shipping_profile_id);


--
-- Name: product_tag product_tag_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_tag
    ADD CONSTRAINT product_tag_pkey PRIMARY KEY (id);


--
-- Name: product_tags product_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_pkey PRIMARY KEY (product_id, product_tag_id);


--
-- Name: product_type product_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_type
    ADD CONSTRAINT product_type_pkey PRIMARY KEY (id);


--
-- Name: product_variant_inventory_item product_variant_inventory_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variant_inventory_item
    ADD CONSTRAINT product_variant_inventory_item_pkey PRIMARY KEY (variant_id, inventory_item_id);


--
-- Name: product_variant_option product_variant_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variant_option
    ADD CONSTRAINT product_variant_option_pkey PRIMARY KEY (variant_id, option_value_id);


--
-- Name: product_variant product_variant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variant
    ADD CONSTRAINT product_variant_pkey PRIMARY KEY (id);


--
-- Name: product_variant_price_set product_variant_price_set_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variant_price_set
    ADD CONSTRAINT product_variant_price_set_pkey PRIMARY KEY (variant_id, price_set_id);


--
-- Name: product_variant_product_image product_variant_product_image_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variant_product_image
    ADD CONSTRAINT product_variant_product_image_pkey PRIMARY KEY (id);


--
-- Name: promotion_application_method promotion_application_method_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_application_method
    ADD CONSTRAINT promotion_application_method_pkey PRIMARY KEY (id);


--
-- Name: promotion_campaign_budget promotion_campaign_budget_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_campaign_budget
    ADD CONSTRAINT promotion_campaign_budget_pkey PRIMARY KEY (id);


--
-- Name: promotion_campaign_budget_usage promotion_campaign_budget_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_campaign_budget_usage
    ADD CONSTRAINT promotion_campaign_budget_usage_pkey PRIMARY KEY (id);


--
-- Name: promotion_campaign promotion_campaign_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_campaign
    ADD CONSTRAINT promotion_campaign_pkey PRIMARY KEY (id);


--
-- Name: promotion promotion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion
    ADD CONSTRAINT promotion_pkey PRIMARY KEY (id);


--
-- Name: promotion_promotion_rule promotion_promotion_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_promotion_rule
    ADD CONSTRAINT promotion_promotion_rule_pkey PRIMARY KEY (promotion_id, promotion_rule_id);


--
-- Name: promotion_rule promotion_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_rule
    ADD CONSTRAINT promotion_rule_pkey PRIMARY KEY (id);


--
-- Name: promotion_rule_value promotion_rule_value_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_rule_value
    ADD CONSTRAINT promotion_rule_value_pkey PRIMARY KEY (id);


--
-- Name: property_label property_label_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_label
    ADD CONSTRAINT property_label_pkey PRIMARY KEY (id);


--
-- Name: provider_identity provider_identity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_identity
    ADD CONSTRAINT provider_identity_pkey PRIMARY KEY (id);


--
-- Name: publishable_api_key_sales_channel publishable_api_key_sales_channel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.publishable_api_key_sales_channel
    ADD CONSTRAINT publishable_api_key_sales_channel_pkey PRIMARY KEY (publishable_key_id, sales_channel_id);


--
-- Name: refund refund_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refund
    ADD CONSTRAINT refund_pkey PRIMARY KEY (id);


--
-- Name: refund_reason refund_reason_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refund_reason
    ADD CONSTRAINT refund_reason_pkey PRIMARY KEY (id);


--
-- Name: region_country region_country_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.region_country
    ADD CONSTRAINT region_country_pkey PRIMARY KEY (iso_2);


--
-- Name: region_payment_provider region_payment_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.region_payment_provider
    ADD CONSTRAINT region_payment_provider_pkey PRIMARY KEY (region_id, payment_provider_id);


--
-- Name: region region_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.region
    ADD CONSTRAINT region_pkey PRIMARY KEY (id);


--
-- Name: reservation_item reservation_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservation_item
    ADD CONSTRAINT reservation_item_pkey PRIMARY KEY (id);


--
-- Name: return_fulfillment return_fulfillment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.return_fulfillment
    ADD CONSTRAINT return_fulfillment_pkey PRIMARY KEY (return_id, fulfillment_id);


--
-- Name: return_item return_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.return_item
    ADD CONSTRAINT return_item_pkey PRIMARY KEY (id);


--
-- Name: return return_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.return
    ADD CONSTRAINT return_pkey PRIMARY KEY (id);


--
-- Name: return_reason return_reason_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.return_reason
    ADD CONSTRAINT return_reason_pkey PRIMARY KEY (id);


--
-- Name: sales_channel sales_channel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_channel
    ADD CONSTRAINT sales_channel_pkey PRIMARY KEY (id);


--
-- Name: sales_channel_stock_location sales_channel_stock_location_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_channel_stock_location
    ADD CONSTRAINT sales_channel_stock_location_pkey PRIMARY KEY (sales_channel_id, stock_location_id);


--
-- Name: score score_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.score
    ADD CONSTRAINT score_pkey PRIMARY KEY (id);


--
-- Name: script_migrations script_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.script_migrations
    ADD CONSTRAINT script_migrations_pkey PRIMARY KEY (id);


--
-- Name: service_zone service_zone_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_zone
    ADD CONSTRAINT service_zone_pkey PRIMARY KEY (id);


--
-- Name: shipping_option shipping_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_option
    ADD CONSTRAINT shipping_option_pkey PRIMARY KEY (id);


--
-- Name: shipping_option_price_set shipping_option_price_set_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_option_price_set
    ADD CONSTRAINT shipping_option_price_set_pkey PRIMARY KEY (shipping_option_id, price_set_id);


--
-- Name: shipping_option_rule shipping_option_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_option_rule
    ADD CONSTRAINT shipping_option_rule_pkey PRIMARY KEY (id);


--
-- Name: shipping_option_type shipping_option_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_option_type
    ADD CONSTRAINT shipping_option_type_pkey PRIMARY KEY (id);


--
-- Name: shipping_profile shipping_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_profile
    ADD CONSTRAINT shipping_profile_pkey PRIMARY KEY (id);


--
-- Name: stock_location_address stock_location_address_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_location_address
    ADD CONSTRAINT stock_location_address_pkey PRIMARY KEY (id);


--
-- Name: stock_location stock_location_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_location
    ADD CONSTRAINT stock_location_pkey PRIMARY KEY (id);


--
-- Name: store_currency store_currency_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_currency
    ADD CONSTRAINT store_currency_pkey PRIMARY KEY (id);


--
-- Name: store_locale store_locale_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_locale
    ADD CONSTRAINT store_locale_pkey PRIMARY KEY (id);


--
-- Name: store store_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store
    ADD CONSTRAINT store_pkey PRIMARY KEY (id);


--
-- Name: tax_provider tax_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_provider
    ADD CONSTRAINT tax_provider_pkey PRIMARY KEY (id);


--
-- Name: tax_rate tax_rate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_rate
    ADD CONSTRAINT tax_rate_pkey PRIMARY KEY (id);


--
-- Name: tax_rate_rule tax_rate_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_rate_rule
    ADD CONSTRAINT tax_rate_rule_pkey PRIMARY KEY (id);


--
-- Name: tax_region tax_region_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_region
    ADD CONSTRAINT tax_region_pkey PRIMARY KEY (id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: user_preference user_preference_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preference
    ADD CONSTRAINT user_preference_pkey PRIMARY KEY (id);


--
-- Name: user_rbac_role user_rbac_role_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_rbac_role
    ADD CONSTRAINT user_rbac_role_pkey PRIMARY KEY (user_id, rbac_role_id);


--
-- Name: view_configuration view_configuration_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.view_configuration
    ADD CONSTRAINT view_configuration_pkey PRIMARY KEY (id);


--
-- Name: workflow_execution workflow_execution_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_execution
    ADD CONSTRAINT workflow_execution_pkey PRIMARY KEY (workflow_id, transaction_id, run_id);


--
-- Name: IDX_account_holder_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_account_holder_deleted_at" ON public.account_holder USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_account_holder_id_5cb3a0c0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_account_holder_id_5cb3a0c0" ON public.customer_account_holder USING btree (account_holder_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_account_holder_provider_id_external_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_account_holder_provider_id_external_id_unique" ON public.account_holder USING btree (provider_id, external_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_api_key_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_api_key_deleted_at" ON public.api_key USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_api_key_redacted; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_api_key_redacted" ON public.api_key USING btree (redacted) WHERE (deleted_at IS NULL);


--
-- Name: IDX_api_key_revoked_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_api_key_revoked_at" ON public.api_key USING btree (revoked_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_api_key_token_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_api_key_token_unique" ON public.api_key USING btree (token);


--
-- Name: IDX_api_key_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_api_key_type" ON public.api_key USING btree (type);


--
-- Name: IDX_application_method_allocation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_application_method_allocation" ON public.promotion_application_method USING btree (allocation);


--
-- Name: IDX_application_method_target_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_application_method_target_type" ON public.promotion_application_method USING btree (target_type);


--
-- Name: IDX_application_method_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_application_method_type" ON public.promotion_application_method USING btree (type);


--
-- Name: IDX_auth_identity_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_auth_identity_deleted_at" ON public.auth_identity USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_mfa_factor_auth_identity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_auth_mfa_factor_auth_identity_id" ON public.auth_mfa_factor USING btree (auth_identity_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_mfa_factor_auth_identity_provider_active; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_auth_mfa_factor_auth_identity_provider_active" ON public.auth_mfa_factor USING btree (auth_identity_id, provider) WHERE ((deleted_at IS NULL) AND (status = ANY (ARRAY['pending'::text, 'enabled'::text])));


--
-- Name: IDX_auth_mfa_factor_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_auth_mfa_factor_deleted_at" ON public.auth_mfa_factor USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_mfa_recovery_code_auth_identity_code_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_auth_mfa_recovery_code_auth_identity_code_hash" ON public.auth_mfa_recovery_code USING btree (auth_identity_id, code_hash) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_mfa_recovery_code_auth_identity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_auth_mfa_recovery_code_auth_identity_id" ON public.auth_mfa_recovery_code USING btree (auth_identity_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_mfa_recovery_code_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_auth_mfa_recovery_code_deleted_at" ON public.auth_mfa_recovery_code USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_password_reset_token_auth_identity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_auth_password_reset_token_auth_identity_id" ON public.auth_password_reset_token USING btree (auth_identity_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_password_reset_token_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_auth_password_reset_token_deleted_at" ON public.auth_password_reset_token USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_password_reset_token_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_auth_password_reset_token_expires_at" ON public.auth_password_reset_token USING btree (expires_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_password_reset_token_provider_identity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_auth_password_reset_token_provider_identity_id" ON public.auth_password_reset_token USING btree (provider_identity_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_password_reset_token_token_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_auth_password_reset_token_token_hash" ON public.auth_password_reset_token USING btree (token_hash) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_verification_auth_identity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_auth_verification_auth_identity_id" ON public.auth_verification USING btree (auth_identity_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_verification_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_auth_verification_deleted_at" ON public.auth_verification USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_verification_unique_auth_identity_entity_id_entity_typ; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_auth_verification_unique_auth_identity_entity_id_entity_typ" ON public.auth_verification USING btree (auth_identity_id, entity_id, entity_type) WHERE (deleted_at IS NULL);


--
-- Name: IDX_campaign_budget_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_campaign_budget_type" ON public.promotion_campaign_budget USING btree (type);


--
-- Name: IDX_capture_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_capture_deleted_at" ON public.capture USING btree (deleted_at);


--
-- Name: IDX_capture_payment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_capture_payment_id" ON public.capture USING btree (payment_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cart_address_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_address_deleted_at" ON public.cart_address USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_cart_billing_address_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_billing_address_id" ON public.cart USING btree (billing_address_id) WHERE ((deleted_at IS NULL) AND (billing_address_id IS NOT NULL));


--
-- Name: IDX_cart_credit_line_reference_reference_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_credit_line_reference_reference_id" ON public.credit_line USING btree (reference, reference_id) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_cart_currency_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_currency_code" ON public.cart USING btree (currency_code);


--
-- Name: IDX_cart_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_customer_id" ON public.cart USING btree (customer_id) WHERE ((deleted_at IS NULL) AND (customer_id IS NOT NULL));


--
-- Name: IDX_cart_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_deleted_at" ON public.cart USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_cart_id_-4a39f6c9; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_id_-4a39f6c9" ON public.cart_payment_collection USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cart_id_-71069c16; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_id_-71069c16" ON public.order_cart USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cart_id_-a9d4a70b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_id_-a9d4a70b" ON public.cart_promotion USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cart_line_item_adjustment_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_line_item_adjustment_deleted_at" ON public.cart_line_item_adjustment USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_cart_line_item_adjustment_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_line_item_adjustment_item_id" ON public.cart_line_item_adjustment USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cart_line_item_cart_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_line_item_cart_id" ON public.cart_line_item USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cart_line_item_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_line_item_deleted_at" ON public.cart_line_item USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_cart_line_item_tax_line_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_line_item_tax_line_deleted_at" ON public.cart_line_item_tax_line USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_cart_line_item_tax_line_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_line_item_tax_line_item_id" ON public.cart_line_item_tax_line USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cart_region_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_region_id" ON public.cart USING btree (region_id) WHERE ((deleted_at IS NULL) AND (region_id IS NOT NULL));


--
-- Name: IDX_cart_sales_channel_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_sales_channel_id" ON public.cart USING btree (sales_channel_id) WHERE ((deleted_at IS NULL) AND (sales_channel_id IS NOT NULL));


--
-- Name: IDX_cart_shipping_address_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_shipping_address_id" ON public.cart USING btree (shipping_address_id) WHERE ((deleted_at IS NULL) AND (shipping_address_id IS NOT NULL));


--
-- Name: IDX_cart_shipping_method_adjustment_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_shipping_method_adjustment_deleted_at" ON public.cart_shipping_method_adjustment USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_cart_shipping_method_adjustment_shipping_method_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_shipping_method_adjustment_shipping_method_id" ON public.cart_shipping_method_adjustment USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cart_shipping_method_cart_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_shipping_method_cart_id" ON public.cart_shipping_method USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cart_shipping_method_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_shipping_method_deleted_at" ON public.cart_shipping_method USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_cart_shipping_method_tax_line_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_shipping_method_tax_line_deleted_at" ON public.cart_shipping_method_tax_line USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_cart_shipping_method_tax_line_shipping_method_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_shipping_method_tax_line_shipping_method_id" ON public.cart_shipping_method_tax_line USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_category_handle_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_category_handle_unique" ON public.product_category USING btree (handle) WHERE (deleted_at IS NULL);


--
-- Name: IDX_collection_handle_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_collection_handle_unique" ON public.product_collection USING btree (handle) WHERE (deleted_at IS NULL);


--
-- Name: IDX_composer_bank_account_composer_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_composer_bank_account_composer_id_unique" ON public.composer_bank_account USING btree (composer_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_composer_bank_account_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_composer_bank_account_deleted_at" ON public.composer_bank_account USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_composer_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_composer_deleted_at" ON public.composer USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_composer_slug_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_composer_slug_unique" ON public.composer USING btree (slug) WHERE (deleted_at IS NULL);


--
-- Name: IDX_credit_line_cart_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_credit_line_cart_id" ON public.credit_line USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_credit_line_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_credit_line_deleted_at" ON public.credit_line USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_customer_account_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_customer_account_deleted_at" ON public.customer_account USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_customer_account_email_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_customer_account_email_unique" ON public.customer_account USING btree (email) WHERE (deleted_at IS NULL);


--
-- Name: IDX_customer_address_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_customer_address_customer_id" ON public.customer_address USING btree (customer_id);


--
-- Name: IDX_customer_address_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_customer_address_deleted_at" ON public.customer_address USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_customer_address_unique_customer_billing; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_customer_address_unique_customer_billing" ON public.customer_address USING btree (customer_id) WHERE (is_default_billing = true);


--
-- Name: IDX_customer_address_unique_customer_shipping; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_customer_address_unique_customer_shipping" ON public.customer_address USING btree (customer_id) WHERE (is_default_shipping = true);


--
-- Name: IDX_customer_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_customer_deleted_at" ON public.customer USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_customer_download_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_customer_download_deleted_at" ON public.customer_download USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_customer_download_download_token_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_customer_download_download_token_unique" ON public.customer_download USING btree (download_token) WHERE (deleted_at IS NULL);


--
-- Name: IDX_customer_email_has_account_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_customer_email_has_account_unique" ON public.customer USING btree (email, has_account) WHERE (deleted_at IS NULL);


--
-- Name: IDX_customer_group_customer_customer_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_customer_group_customer_customer_group_id" ON public.customer_group_customer USING btree (customer_group_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_customer_group_customer_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_customer_group_customer_customer_id" ON public.customer_group_customer USING btree (customer_id);


--
-- Name: IDX_customer_group_customer_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_customer_group_customer_deleted_at" ON public.customer_group_customer USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_customer_group_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_customer_group_deleted_at" ON public.customer_group USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_customer_group_name_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_customer_group_name_unique" ON public.customer_group USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: IDX_customer_id_5cb3a0c0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_customer_id_5cb3a0c0" ON public.customer_account_holder USING btree (customer_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_deleted_at_-1d67bae40; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_-1d67bae40" ON public.publishable_api_key_sales_channel USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-1e5992737; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_-1e5992737" ON public.location_fulfillment_provider USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-31ea43a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_-31ea43a" ON public.return_fulfillment USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-4a39f6c9; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_-4a39f6c9" ON public.cart_payment_collection USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-71069c16; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_-71069c16" ON public.order_cart USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-71518339; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_-71518339" ON public.order_promotion USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-85069d44; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_-85069d44" ON public.invite_rbac_role USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-a9d4a70b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_-a9d4a70b" ON public.cart_promotion USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-e88adb96; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_-e88adb96" ON public.location_fulfillment_set USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-e8d2543e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_-e8d2543e" ON public.order_fulfillment USING btree (deleted_at);


--
-- Name: IDX_deleted_at_17a262437; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_17a262437" ON public.product_shipping_profile USING btree (deleted_at);


--
-- Name: IDX_deleted_at_17b4c4e35; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_17b4c4e35" ON public.product_variant_inventory_item USING btree (deleted_at);


--
-- Name: IDX_deleted_at_1c934dab0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_1c934dab0" ON public.region_payment_provider USING btree (deleted_at);


--
-- Name: IDX_deleted_at_20b454295; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_20b454295" ON public.product_sales_channel USING btree (deleted_at);


--
-- Name: IDX_deleted_at_26d06f470; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_26d06f470" ON public.sales_channel_stock_location USING btree (deleted_at);


--
-- Name: IDX_deleted_at_52b23597; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_52b23597" ON public.product_variant_price_set USING btree (deleted_at);


--
-- Name: IDX_deleted_at_5cb3a0c0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_5cb3a0c0" ON public.customer_account_holder USING btree (deleted_at);


--
-- Name: IDX_deleted_at_64ff0c4c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_64ff0c4c" ON public.user_rbac_role USING btree (deleted_at);


--
-- Name: IDX_deleted_at_ba32fa9c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_ba32fa9c" ON public.shipping_option_price_set USING btree (deleted_at);


--
-- Name: IDX_deleted_at_f42b9949; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_f42b9949" ON public.order_payment_collection USING btree (deleted_at);


--
-- Name: IDX_fulfillment_address_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_address_deleted_at" ON public.fulfillment_address USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_fulfillment_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_deleted_at" ON public.fulfillment USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_fulfillment_id_-31ea43a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_id_-31ea43a" ON public.return_fulfillment USING btree (fulfillment_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_id_-e8d2543e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_id_-e8d2543e" ON public.order_fulfillment USING btree (fulfillment_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_item_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_item_deleted_at" ON public.fulfillment_item USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_fulfillment_item_fulfillment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_item_fulfillment_id" ON public.fulfillment_item USING btree (fulfillment_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_item_inventory_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_item_inventory_item_id" ON public.fulfillment_item USING btree (inventory_item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_item_line_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_item_line_item_id" ON public.fulfillment_item USING btree (line_item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_label_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_label_deleted_at" ON public.fulfillment_label USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_fulfillment_label_fulfillment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_label_fulfillment_id" ON public.fulfillment_label USING btree (fulfillment_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_location_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_location_id" ON public.fulfillment USING btree (location_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_provider_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_provider_deleted_at" ON public.fulfillment_provider USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_provider_id_-1e5992737; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_provider_id_-1e5992737" ON public.location_fulfillment_provider USING btree (fulfillment_provider_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_set_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_set_deleted_at" ON public.fulfillment_set USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_fulfillment_set_id_-e88adb96; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_set_id_-e88adb96" ON public.location_fulfillment_set USING btree (fulfillment_set_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_set_name_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_fulfillment_set_name_unique" ON public.fulfillment_set USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_shipping_option_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_shipping_option_id" ON public.fulfillment USING btree (shipping_option_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_geo_zone_city; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_geo_zone_city" ON public.geo_zone USING btree (city) WHERE ((deleted_at IS NULL) AND (city IS NOT NULL));


--
-- Name: IDX_geo_zone_country_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_geo_zone_country_code" ON public.geo_zone USING btree (country_code) WHERE (deleted_at IS NULL);


--
-- Name: IDX_geo_zone_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_geo_zone_deleted_at" ON public.geo_zone USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_geo_zone_province_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_geo_zone_province_code" ON public.geo_zone USING btree (province_code) WHERE ((deleted_at IS NULL) AND (province_code IS NOT NULL));


--
-- Name: IDX_geo_zone_service_zone_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_geo_zone_service_zone_id" ON public.geo_zone USING btree (service_zone_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_hero_content_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_hero_content_deleted_at" ON public.hero_content USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_id_-1d67bae40; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_-1d67bae40" ON public.publishable_api_key_sales_channel USING btree (id);


--
-- Name: IDX_id_-1e5992737; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_-1e5992737" ON public.location_fulfillment_provider USING btree (id);


--
-- Name: IDX_id_-31ea43a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_-31ea43a" ON public.return_fulfillment USING btree (id);


--
-- Name: IDX_id_-4a39f6c9; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_-4a39f6c9" ON public.cart_payment_collection USING btree (id);


--
-- Name: IDX_id_-71069c16; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_-71069c16" ON public.order_cart USING btree (id);


--
-- Name: IDX_id_-71518339; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_-71518339" ON public.order_promotion USING btree (id);


--
-- Name: IDX_id_-85069d44; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_-85069d44" ON public.invite_rbac_role USING btree (id);


--
-- Name: IDX_id_-a9d4a70b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_-a9d4a70b" ON public.cart_promotion USING btree (id);


--
-- Name: IDX_id_-e88adb96; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_-e88adb96" ON public.location_fulfillment_set USING btree (id);


--
-- Name: IDX_id_-e8d2543e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_-e8d2543e" ON public.order_fulfillment USING btree (id);


--
-- Name: IDX_id_17a262437; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_17a262437" ON public.product_shipping_profile USING btree (id);


--
-- Name: IDX_id_17b4c4e35; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_17b4c4e35" ON public.product_variant_inventory_item USING btree (id);


--
-- Name: IDX_id_1c934dab0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_1c934dab0" ON public.region_payment_provider USING btree (id);


--
-- Name: IDX_id_20b454295; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_20b454295" ON public.product_sales_channel USING btree (id);


--
-- Name: IDX_id_26d06f470; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_26d06f470" ON public.sales_channel_stock_location USING btree (id);


--
-- Name: IDX_id_52b23597; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_52b23597" ON public.product_variant_price_set USING btree (id);


--
-- Name: IDX_id_5cb3a0c0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_5cb3a0c0" ON public.customer_account_holder USING btree (id);


--
-- Name: IDX_id_64ff0c4c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_64ff0c4c" ON public.user_rbac_role USING btree (id);


--
-- Name: IDX_id_ba32fa9c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_ba32fa9c" ON public.shipping_option_price_set USING btree (id);


--
-- Name: IDX_id_f42b9949; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_f42b9949" ON public.order_payment_collection USING btree (id);


--
-- Name: IDX_image_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_image_deleted_at" ON public.image USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_image_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_image_product_id" ON public.image USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_inventory_item_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_inventory_item_deleted_at" ON public.inventory_item USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_inventory_item_id_17b4c4e35; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_inventory_item_id_17b4c4e35" ON public.product_variant_inventory_item USING btree (inventory_item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_inventory_item_sku; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_inventory_item_sku" ON public.inventory_item USING btree (sku) WHERE (deleted_at IS NULL);


--
-- Name: IDX_inventory_level_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_inventory_level_deleted_at" ON public.inventory_level USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_inventory_level_inventory_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_inventory_level_inventory_item_id" ON public.inventory_level USING btree (inventory_item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_inventory_level_location_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_inventory_level_location_id" ON public.inventory_level USING btree (location_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_inventory_level_location_id_inventory_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_inventory_level_location_id_inventory_item_id" ON public.inventory_level USING btree (inventory_item_id, location_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_invite_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_invite_deleted_at" ON public.invite USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_invite_email_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_invite_email_unique" ON public.invite USING btree (email) WHERE (deleted_at IS NULL);


--
-- Name: IDX_invite_id_-85069d44; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_invite_id_-85069d44" ON public.invite_rbac_role USING btree (invite_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_invite_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_invite_token" ON public.invite USING btree (token) WHERE (deleted_at IS NULL);


--
-- Name: IDX_layout_configuration_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_layout_configuration_deleted_at" ON public.layout_configuration USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_layout_configuration_zone_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_layout_configuration_zone_unique" ON public.layout_configuration USING btree (zone) WHERE ((is_system_default = true) AND (deleted_at IS NULL));


--
-- Name: IDX_layout_configuration_zone_user_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_layout_configuration_zone_user_id_unique" ON public.layout_configuration USING btree (zone, user_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_line_item_adjustment_promotion_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_line_item_adjustment_promotion_id" ON public.cart_line_item_adjustment USING btree (promotion_id) WHERE ((deleted_at IS NULL) AND (promotion_id IS NOT NULL));


--
-- Name: IDX_line_item_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_line_item_product_id" ON public.cart_line_item USING btree (product_id) WHERE ((deleted_at IS NULL) AND (product_id IS NOT NULL));


--
-- Name: IDX_line_item_product_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_line_item_product_type_id" ON public.order_line_item USING btree (product_type_id) WHERE ((deleted_at IS NULL) AND (product_type_id IS NOT NULL));


--
-- Name: IDX_line_item_tax_line_tax_rate_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_line_item_tax_line_tax_rate_id" ON public.cart_line_item_tax_line USING btree (tax_rate_id) WHERE ((deleted_at IS NULL) AND (tax_rate_id IS NOT NULL));


--
-- Name: IDX_line_item_variant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_line_item_variant_id" ON public.cart_line_item USING btree (variant_id) WHERE ((deleted_at IS NULL) AND (variant_id IS NOT NULL));


--
-- Name: IDX_notification_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_notification_deleted_at" ON public.notification USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_notification_idempotency_key_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_notification_idempotency_key_unique" ON public.notification USING btree (idempotency_key) WHERE (deleted_at IS NULL);


--
-- Name: IDX_notification_provider_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_notification_provider_deleted_at" ON public.notification_provider USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_notification_provider_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_notification_provider_id" ON public.notification USING btree (provider_id);


--
-- Name: IDX_notification_receiver_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_notification_receiver_id" ON public.notification USING btree (receiver_id);


--
-- Name: IDX_option_value_option_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_option_value_option_id_unique" ON public.product_option_value USING btree (option_id, value) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_address_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_address_customer_id" ON public.order_address USING btree (customer_id);


--
-- Name: IDX_order_address_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_address_deleted_at" ON public.order_address USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_billing_address_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_billing_address_id" ON public."order" USING btree (billing_address_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_change_action_claim_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_action_claim_id" ON public.order_change_action USING btree (claim_id) WHERE ((claim_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_change_action_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_action_deleted_at" ON public.order_change_action USING btree (deleted_at);


--
-- Name: IDX_order_change_action_exchange_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_action_exchange_id" ON public.order_change_action USING btree (exchange_id) WHERE ((exchange_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_change_action_order_change_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_action_order_change_id" ON public.order_change_action USING btree (order_change_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_change_action_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_action_order_id" ON public.order_change_action USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_change_action_ordering; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_action_ordering" ON public.order_change_action USING btree (ordering) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_change_action_return_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_action_return_id" ON public.order_change_action USING btree (return_id) WHERE ((return_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_change_change_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_change_type" ON public.order_change USING btree (change_type);


--
-- Name: IDX_order_change_claim_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_claim_id" ON public.order_change USING btree (claim_id) WHERE ((claim_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_change_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_deleted_at" ON public.order_change USING btree (deleted_at);


--
-- Name: IDX_order_change_exchange_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_exchange_id" ON public.order_change USING btree (exchange_id) WHERE ((exchange_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_change_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_order_id" ON public.order_change USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_change_order_id_version; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_order_id_version" ON public.order_change USING btree (order_id, version);


--
-- Name: IDX_order_change_return_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_return_id" ON public.order_change USING btree (return_id) WHERE ((return_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_change_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_status" ON public.order_change USING btree (status) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_change_version; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_version" ON public.order_change USING btree (order_id, version) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_claim_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_claim_deleted_at" ON public.order_claim USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_claim_display_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_claim_display_id" ON public.order_claim USING btree (display_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_claim_item_claim_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_claim_item_claim_id" ON public.order_claim_item USING btree (claim_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_claim_item_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_claim_item_deleted_at" ON public.order_claim_item USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_claim_item_image_claim_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_claim_item_image_claim_item_id" ON public.order_claim_item_image USING btree (claim_item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_claim_item_image_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_claim_item_image_deleted_at" ON public.order_claim_item_image USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_order_claim_item_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_claim_item_item_id" ON public.order_claim_item USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_claim_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_claim_order_id" ON public.order_claim USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_claim_return_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_claim_return_id" ON public.order_claim USING btree (return_id) WHERE ((return_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_credit_line_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_credit_line_deleted_at" ON public.order_credit_line USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_order_credit_line_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_credit_line_order_id" ON public.order_credit_line USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_credit_line_order_id_version; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_credit_line_order_id_version" ON public.order_credit_line USING btree (order_id, version) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_currency_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_currency_code" ON public."order" USING btree (currency_code) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_custom_display_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_order_custom_display_id" ON public."order" USING btree (custom_display_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_customer_id" ON public."order" USING btree (customer_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_deleted_at" ON public."order" USING btree (deleted_at);


--
-- Name: IDX_order_display_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_display_id" ON public."order" USING btree (display_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_exchange_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_exchange_deleted_at" ON public.order_exchange USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_exchange_display_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_exchange_display_id" ON public.order_exchange USING btree (display_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_exchange_item_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_exchange_item_deleted_at" ON public.order_exchange_item USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_exchange_item_exchange_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_exchange_item_exchange_id" ON public.order_exchange_item USING btree (exchange_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_exchange_item_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_exchange_item_item_id" ON public.order_exchange_item USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_exchange_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_exchange_order_id" ON public.order_exchange USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_exchange_return_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_exchange_return_id" ON public.order_exchange USING btree (return_id) WHERE ((return_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_id_-71069c16; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_id_-71069c16" ON public.order_cart USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_id_-71518339; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_id_-71518339" ON public.order_promotion USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_id_-e8d2543e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_id_-e8d2543e" ON public.order_fulfillment USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_id_f42b9949; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_id_f42b9949" ON public.order_payment_collection USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_is_draft_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_is_draft_order" ON public."order" USING btree (is_draft_order) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_item_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_item_deleted_at" ON public.order_item USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_order_item_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_item_item_id" ON public.order_item USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_item_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_item_order_id" ON public.order_item USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_item_order_id_version; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_item_order_id_version" ON public.order_item USING btree (order_id, version) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_line_item_adjustment_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_line_item_adjustment_item_id" ON public.order_line_item_adjustment USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_line_item_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_line_item_product_id" ON public.order_line_item USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_line_item_tax_line_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_line_item_tax_line_item_id" ON public.order_line_item_tax_line USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_line_item_variant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_line_item_variant_id" ON public.order_line_item USING btree (variant_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_region_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_region_id" ON public."order" USING btree (region_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_sales_channel_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_sales_channel_id" ON public."order" USING btree (sales_channel_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_shipping_address_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_shipping_address_id" ON public."order" USING btree (shipping_address_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_shipping_claim_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_shipping_claim_id" ON public.order_shipping USING btree (claim_id) WHERE ((claim_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_shipping_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_shipping_deleted_at" ON public.order_shipping USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_order_shipping_exchange_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_shipping_exchange_id" ON public.order_shipping USING btree (exchange_id) WHERE ((exchange_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_shipping_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_shipping_item_id" ON public.order_shipping USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_shipping_method_adjustment_shipping_method_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_shipping_method_adjustment_shipping_method_id" ON public.order_shipping_method_adjustment USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_shipping_method_adjustment_version_shipping_method; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_order_shipping_method_adjustment_version_shipping_method" ON public.order_shipping_method_adjustment USING btree (version, shipping_method_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_shipping_method_shipping_option_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_shipping_method_shipping_option_id" ON public.order_shipping_method USING btree (shipping_option_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_shipping_method_tax_line_shipping_method_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_shipping_method_tax_line_shipping_method_id" ON public.order_shipping_method_tax_line USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_shipping_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_shipping_order_id" ON public.order_shipping USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_shipping_order_id_version; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_shipping_order_id_version" ON public.order_shipping USING btree (order_id, version) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_shipping_return_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_shipping_return_id" ON public.order_shipping USING btree (return_id) WHERE ((return_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_shipping_shipping_method_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_shipping_shipping_method_id" ON public.order_shipping USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_summary_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_summary_deleted_at" ON public.order_summary USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_order_summary_order_id_version; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_summary_order_id_version" ON public.order_summary USING btree (order_id, version) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_transaction_claim_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_transaction_claim_id" ON public.order_transaction USING btree (claim_id) WHERE ((claim_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_transaction_currency_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_transaction_currency_code" ON public.order_transaction USING btree (currency_code) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_transaction_exchange_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_transaction_exchange_id" ON public.order_transaction USING btree (exchange_id) WHERE ((exchange_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_transaction_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_transaction_order_id" ON public.order_transaction USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_transaction_order_id_version; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_transaction_order_id_version" ON public.order_transaction USING btree (order_id, version) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_transaction_reference_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_transaction_reference_id" ON public.order_transaction USING btree (reference_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_transaction_return_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_transaction_return_id" ON public.order_transaction USING btree (return_id) WHERE ((return_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_payment_collection_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payment_collection_deleted_at" ON public.payment_collection USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_payment_collection_id_-4a39f6c9; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payment_collection_id_-4a39f6c9" ON public.cart_payment_collection USING btree (payment_collection_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_payment_collection_id_f42b9949; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payment_collection_id_f42b9949" ON public.order_payment_collection USING btree (payment_collection_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_payment_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payment_deleted_at" ON public.payment USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_payment_payment_collection_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payment_payment_collection_id" ON public.payment USING btree (payment_collection_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_payment_payment_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payment_payment_session_id" ON public.payment USING btree (payment_session_id);


--
-- Name: IDX_payment_payment_session_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_payment_payment_session_id_unique" ON public.payment USING btree (payment_session_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_payment_provider_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payment_provider_deleted_at" ON public.payment_provider USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_payment_provider_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payment_provider_id" ON public.payment USING btree (provider_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_payment_provider_id_1c934dab0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payment_provider_id_1c934dab0" ON public.region_payment_provider USING btree (payment_provider_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_payment_session_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payment_session_deleted_at" ON public.payment_session USING btree (deleted_at);


--
-- Name: IDX_payment_session_payment_collection_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payment_session_payment_collection_id" ON public.payment_session USING btree (payment_collection_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_payout_batch_batch_number_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_payout_batch_batch_number_unique" ON public.payout_batch USING btree (batch_number) WHERE (deleted_at IS NULL);


--
-- Name: IDX_payout_batch_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payout_batch_deleted_at" ON public.payout_batch USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_payout_item_batch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payout_item_batch_id" ON public.payout_item USING btree (batch_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_payout_item_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payout_item_deleted_at" ON public.payout_item USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_currency_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_currency_code" ON public.price USING btree (currency_code) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_deleted_at" ON public.price USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_price_list_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_list_deleted_at" ON public.price_list USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_price_list_id_status_starts_at_ends_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_list_id_status_starts_at_ends_at" ON public.price_list USING btree (id, status, starts_at, ends_at) WHERE ((deleted_at IS NULL) AND (status = 'active'::text));


--
-- Name: IDX_price_list_rule_attribute; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_list_rule_attribute" ON public.price_list_rule USING btree (attribute) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_list_rule_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_list_rule_deleted_at" ON public.price_list_rule USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_price_list_rule_price_list_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_list_rule_price_list_id" ON public.price_list_rule USING btree (price_list_id) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_price_list_rule_value; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_list_rule_value" ON public.price_list_rule USING gin (value) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_preference_attribute_value; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_price_preference_attribute_value" ON public.price_preference USING btree (attribute, value) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_preference_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_preference_deleted_at" ON public.price_preference USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_price_price_list_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_price_list_id" ON public.price USING btree (price_list_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_price_set_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_price_set_id" ON public.price USING btree (price_set_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_rule_attribute; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_rule_attribute" ON public.price_rule USING btree (attribute) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_rule_attribute_value; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_rule_attribute_value" ON public.price_rule USING btree (attribute, value) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_rule_attribute_value_price_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_rule_attribute_value_price_id" ON public.price_rule USING btree (attribute, value, price_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_rule_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_rule_deleted_at" ON public.price_rule USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_price_rule_operator; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_rule_operator" ON public.price_rule USING btree (operator);


--
-- Name: IDX_price_rule_operator_value; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_rule_operator_value" ON public.price_rule USING btree (operator, value) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_rule_price_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_rule_price_id" ON public.price_rule USING btree (price_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_rule_price_id_attribute_operator_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_price_rule_price_id_attribute_operator_unique" ON public.price_rule USING btree (price_id, attribute, operator) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_set_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_set_deleted_at" ON public.price_set USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_price_set_id_52b23597; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_set_id_52b23597" ON public.product_variant_price_set USING btree (price_set_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_set_id_ba32fa9c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_set_id_ba32fa9c" ON public.shipping_option_price_set USING btree (price_set_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_category_parent_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_category_parent_category_id" ON public.product_category USING btree (parent_category_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_category_path; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_category_path" ON public.product_category USING btree (mpath) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_collection_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_collection_deleted_at" ON public.product_collection USING btree (deleted_at);


--
-- Name: IDX_product_collection_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_collection_id" ON public.product USING btree (collection_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_deleted_at" ON public.product USING btree (deleted_at);


--
-- Name: IDX_product_handle_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_product_handle_unique" ON public.product USING btree (handle) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_id_17a262437; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_id_17a262437" ON public.product_shipping_profile USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_id_20b454295; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_id_20b454295" ON public.product_sales_channel USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_image_rank; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_image_rank" ON public.image USING btree (rank) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_image_rank_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_image_rank_product_id" ON public.image USING btree (rank, product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_image_url; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_image_url" ON public.image USING btree (url) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_image_url_rank_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_image_url_rank_product_id" ON public.image USING btree (url, rank, product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_option_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_option_deleted_at" ON public.product_option USING btree (deleted_at);


--
-- Name: IDX_product_option_global_title_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_product_option_global_title_unique" ON public.product_option USING btree (title) WHERE ((deleted_at IS NULL) AND (is_exclusive = false));


--
-- Name: IDX_product_option_value_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_option_value_deleted_at" ON public.product_option_value USING btree (deleted_at);


--
-- Name: IDX_product_option_value_option_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_option_value_option_id" ON public.product_option_value USING btree (option_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_product_option_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_product_option_deleted_at" ON public.product_product_option USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_product_option_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_product_option_product_id" ON public.product_product_option USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_product_option_product_option_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_product_option_product_option_id" ON public.product_product_option USING btree (product_option_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_product_option_value_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_product_option_value_deleted_at" ON public.product_product_option_value USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_product_option_value_product_option_value_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_product_option_value_product_option_value_id" ON public.product_product_option_value USING btree (product_option_value_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_product_option_value_product_product_option_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_product_option_value_product_product_option_id" ON public.product_product_option_value USING btree (product_product_option_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_status" ON public.product USING btree (status) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_tag_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_tag_deleted_at" ON public.product_tag USING btree (deleted_at);


--
-- Name: IDX_product_type_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_type_deleted_at" ON public.product_type USING btree (deleted_at);


--
-- Name: IDX_product_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_type_id" ON public.product USING btree (type_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_variant_barcode_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_product_variant_barcode_unique" ON public.product_variant USING btree (barcode) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_variant_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_variant_deleted_at" ON public.product_variant USING btree (deleted_at);


--
-- Name: IDX_product_variant_ean_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_product_variant_ean_unique" ON public.product_variant USING btree (ean) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_variant_id_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_variant_id_product_id" ON public.product_variant USING btree (id, product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_variant_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_variant_product_id" ON public.product_variant USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_variant_product_image_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_variant_product_image_deleted_at" ON public.product_variant_product_image USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_variant_product_image_image_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_variant_product_image_image_id" ON public.product_variant_product_image USING btree (image_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_variant_product_image_variant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_variant_product_image_variant_id" ON public.product_variant_product_image USING btree (variant_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_variant_sku_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_product_variant_sku_unique" ON public.product_variant USING btree (sku) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_variant_upc_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_product_variant_upc_unique" ON public.product_variant USING btree (upc) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_application_method_currency_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_application_method_currency_code" ON public.promotion_application_method USING btree (currency_code) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_promotion_application_method_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_application_method_deleted_at" ON public.promotion_application_method USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_application_method_promotion_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_promotion_application_method_promotion_id_unique" ON public.promotion_application_method USING btree (promotion_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_campaign_budget_campaign_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_promotion_campaign_budget_campaign_id_unique" ON public.promotion_campaign_budget USING btree (campaign_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_campaign_budget_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_campaign_budget_deleted_at" ON public.promotion_campaign_budget USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_campaign_budget_usage_attribute_value_budget_id_u; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_promotion_campaign_budget_usage_attribute_value_budget_id_u" ON public.promotion_campaign_budget_usage USING btree (attribute_value, budget_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_campaign_budget_usage_budget_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_campaign_budget_usage_budget_id" ON public.promotion_campaign_budget_usage USING btree (budget_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_campaign_budget_usage_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_campaign_budget_usage_deleted_at" ON public.promotion_campaign_budget_usage USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_campaign_campaign_identifier_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_promotion_campaign_campaign_identifier_unique" ON public.promotion_campaign USING btree (campaign_identifier) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_campaign_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_campaign_deleted_at" ON public.promotion_campaign USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_campaign_id" ON public.promotion USING btree (campaign_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_deleted_at" ON public.promotion USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_id_-71518339; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_id_-71518339" ON public.order_promotion USING btree (promotion_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_id_-a9d4a70b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_id_-a9d4a70b" ON public.cart_promotion USING btree (promotion_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_is_automatic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_is_automatic" ON public.promotion USING btree (is_automatic) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_rule_attribute; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_rule_attribute" ON public.promotion_rule USING btree (attribute);


--
-- Name: IDX_promotion_rule_attribute_operator; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_rule_attribute_operator" ON public.promotion_rule USING btree (attribute, operator) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_rule_attribute_operator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_rule_attribute_operator_id" ON public.promotion_rule USING btree (operator, attribute, id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_rule_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_rule_deleted_at" ON public.promotion_rule USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_rule_operator; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_rule_operator" ON public.promotion_rule USING btree (operator);


--
-- Name: IDX_promotion_rule_value_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_rule_value_deleted_at" ON public.promotion_rule_value USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_rule_value_promotion_rule_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_rule_value_promotion_rule_id" ON public.promotion_rule_value USING btree (promotion_rule_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_rule_value_rule_id_value; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_rule_value_rule_id_value" ON public.promotion_rule_value USING btree (promotion_rule_id, value) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_rule_value_value; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_rule_value_value" ON public.promotion_rule_value USING btree (value) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_status" ON public.promotion USING btree (status) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_type" ON public.promotion USING btree (type);


--
-- Name: IDX_property_label_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_property_label_deleted_at" ON public.property_label USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_property_label_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_property_label_entity" ON public.property_label USING btree (entity) WHERE (deleted_at IS NULL);


--
-- Name: IDX_property_label_entity_property_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_property_label_entity_property_unique" ON public.property_label USING btree (entity, property) WHERE (deleted_at IS NULL);


--
-- Name: IDX_provider_identity_auth_identity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_provider_identity_auth_identity_id" ON public.provider_identity USING btree (auth_identity_id);


--
-- Name: IDX_provider_identity_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_provider_identity_deleted_at" ON public.provider_identity USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_provider_identity_provider_entity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_provider_identity_provider_entity_id" ON public.provider_identity USING btree (entity_id, provider);


--
-- Name: IDX_publishable_key_id_-1d67bae40; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_publishable_key_id_-1d67bae40" ON public.publishable_api_key_sales_channel USING btree (publishable_key_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_rbac_role_id_-85069d44; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_rbac_role_id_-85069d44" ON public.invite_rbac_role USING btree (rbac_role_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_rbac_role_id_64ff0c4c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_rbac_role_id_64ff0c4c" ON public.user_rbac_role USING btree (rbac_role_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_refund_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_refund_deleted_at" ON public.refund USING btree (deleted_at);


--
-- Name: IDX_refund_payment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_refund_payment_id" ON public.refund USING btree (payment_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_refund_reason_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_refund_reason_deleted_at" ON public.refund_reason USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_refund_refund_reason_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_refund_refund_reason_id" ON public.refund USING btree (refund_reason_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_region_country_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_region_country_deleted_at" ON public.region_country USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_region_country_region_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_region_country_region_id" ON public.region_country USING btree (region_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_region_country_region_id_iso_2_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_region_country_region_id_iso_2_unique" ON public.region_country USING btree (region_id, iso_2);


--
-- Name: IDX_region_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_region_deleted_at" ON public.region USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_region_id_1c934dab0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_region_id_1c934dab0" ON public.region_payment_provider USING btree (region_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_reservation_item_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_reservation_item_deleted_at" ON public.reservation_item USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_reservation_item_inventory_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_reservation_item_inventory_item_id" ON public.reservation_item USING btree (inventory_item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_reservation_item_line_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_reservation_item_line_item_id" ON public.reservation_item USING btree (line_item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_reservation_item_location_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_reservation_item_location_id" ON public.reservation_item USING btree (location_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_return_claim_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_return_claim_id" ON public.return USING btree (claim_id) WHERE ((claim_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_return_display_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_return_display_id" ON public.return USING btree (display_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_return_exchange_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_return_exchange_id" ON public.return USING btree (exchange_id) WHERE ((exchange_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_return_id_-31ea43a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_return_id_-31ea43a" ON public.return_fulfillment USING btree (return_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_return_item_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_return_item_deleted_at" ON public.return_item USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_return_item_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_return_item_item_id" ON public.return_item USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_return_item_reason_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_return_item_reason_id" ON public.return_item USING btree (reason_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_return_item_return_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_return_item_return_id" ON public.return_item USING btree (return_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_return_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_return_order_id" ON public.return USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_return_reason_parent_return_reason_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_return_reason_parent_return_reason_id" ON public.return_reason USING btree (parent_return_reason_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_return_reason_value; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_return_reason_value" ON public.return_reason USING btree (value) WHERE (deleted_at IS NULL);


--
-- Name: IDX_sales_channel_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_sales_channel_deleted_at" ON public.sales_channel USING btree (deleted_at);


--
-- Name: IDX_sales_channel_id_-1d67bae40; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_sales_channel_id_-1d67bae40" ON public.publishable_api_key_sales_channel USING btree (sales_channel_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_sales_channel_id_20b454295; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_sales_channel_id_20b454295" ON public.product_sales_channel USING btree (sales_channel_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_sales_channel_id_26d06f470; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_sales_channel_id_26d06f470" ON public.sales_channel_stock_location USING btree (sales_channel_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_score_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_score_deleted_at" ON public.score USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_score_slug_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_score_slug_unique" ON public.score USING btree (slug) WHERE (deleted_at IS NULL);


--
-- Name: IDX_service_zone_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_service_zone_deleted_at" ON public.service_zone USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_service_zone_fulfillment_set_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_service_zone_fulfillment_set_id" ON public.service_zone USING btree (fulfillment_set_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_service_zone_name_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_service_zone_name_unique" ON public.service_zone USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: IDX_shipping_method_adjustment_promotion_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_method_adjustment_promotion_id" ON public.cart_shipping_method_adjustment USING btree (promotion_id) WHERE ((deleted_at IS NULL) AND (promotion_id IS NOT NULL));


--
-- Name: IDX_shipping_method_option_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_method_option_id" ON public.cart_shipping_method USING btree (shipping_option_id) WHERE ((deleted_at IS NULL) AND (shipping_option_id IS NOT NULL));


--
-- Name: IDX_shipping_method_tax_line_tax_rate_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_method_tax_line_tax_rate_id" ON public.cart_shipping_method_tax_line USING btree (tax_rate_id) WHERE ((deleted_at IS NULL) AND (tax_rate_id IS NOT NULL));


--
-- Name: IDX_shipping_option_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_option_deleted_at" ON public.shipping_option USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_shipping_option_id_ba32fa9c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_option_id_ba32fa9c" ON public.shipping_option_price_set USING btree (shipping_option_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_shipping_option_provider_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_option_provider_id" ON public.shipping_option USING btree (provider_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_shipping_option_rule_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_option_rule_deleted_at" ON public.shipping_option_rule USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_shipping_option_rule_shipping_option_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_option_rule_shipping_option_id" ON public.shipping_option_rule USING btree (shipping_option_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_shipping_option_service_zone_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_option_service_zone_id" ON public.shipping_option USING btree (service_zone_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_shipping_option_shipping_option_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_option_shipping_option_type_id" ON public.shipping_option USING btree (shipping_option_type_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_shipping_option_shipping_profile_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_option_shipping_profile_id" ON public.shipping_option USING btree (shipping_profile_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_shipping_option_type_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_option_type_deleted_at" ON public.shipping_option_type USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_shipping_profile_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_profile_deleted_at" ON public.shipping_profile USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_shipping_profile_id_17a262437; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_profile_id_17a262437" ON public.product_shipping_profile USING btree (shipping_profile_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_shipping_profile_name_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_shipping_profile_name_unique" ON public.shipping_profile USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: IDX_single_default_region; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_single_default_region" ON public.tax_rate USING btree (tax_region_id) WHERE ((is_default = true) AND (deleted_at IS NULL));


--
-- Name: IDX_stock_location_address_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_stock_location_address_deleted_at" ON public.stock_location_address USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_stock_location_address_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_stock_location_address_id_unique" ON public.stock_location USING btree (address_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_stock_location_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_stock_location_deleted_at" ON public.stock_location USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_stock_location_id_-1e5992737; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_stock_location_id_-1e5992737" ON public.location_fulfillment_provider USING btree (stock_location_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_stock_location_id_-e88adb96; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_stock_location_id_-e88adb96" ON public.location_fulfillment_set USING btree (stock_location_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_stock_location_id_26d06f470; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_stock_location_id_26d06f470" ON public.sales_channel_stock_location USING btree (stock_location_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_store_currency_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_store_currency_deleted_at" ON public.store_currency USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_store_currency_store_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_store_currency_store_id" ON public.store_currency USING btree (store_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_store_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_store_deleted_at" ON public.store USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_store_locale_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_store_locale_deleted_at" ON public.store_locale USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_store_locale_store_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_store_locale_store_id" ON public.store_locale USING btree (store_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_tag_value_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_tag_value_unique" ON public.product_tag USING btree (value) WHERE (deleted_at IS NULL);


--
-- Name: IDX_tax_provider_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_tax_provider_deleted_at" ON public.tax_provider USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_tax_rate_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_tax_rate_deleted_at" ON public.tax_rate USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_tax_rate_rule_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_tax_rate_rule_deleted_at" ON public.tax_rate_rule USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_tax_rate_rule_reference_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_tax_rate_rule_reference_id" ON public.tax_rate_rule USING btree (reference_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_tax_rate_rule_tax_rate_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_tax_rate_rule_tax_rate_id" ON public.tax_rate_rule USING btree (tax_rate_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_tax_rate_rule_unique_rate_reference; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_tax_rate_rule_unique_rate_reference" ON public.tax_rate_rule USING btree (tax_rate_id, reference_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_tax_rate_tax_region_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_tax_rate_tax_region_id" ON public.tax_rate USING btree (tax_region_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_tax_region_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_tax_region_deleted_at" ON public.tax_region USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_tax_region_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_tax_region_parent_id" ON public.tax_region USING btree (parent_id);


--
-- Name: IDX_tax_region_provider_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_tax_region_provider_id" ON public.tax_region USING btree (provider_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_tax_region_unique_country_nullable_province; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_tax_region_unique_country_nullable_province" ON public.tax_region USING btree (country_code) WHERE ((province_code IS NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_tax_region_unique_country_province; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_tax_region_unique_country_province" ON public.tax_region USING btree (country_code, province_code) WHERE (deleted_at IS NULL);


--
-- Name: IDX_type_value_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_type_value_unique" ON public.product_type USING btree (value) WHERE (deleted_at IS NULL);


--
-- Name: IDX_unique_promotion_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_unique_promotion_code" ON public.promotion USING btree (code) WHERE (deleted_at IS NULL);


--
-- Name: IDX_user_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_user_deleted_at" ON public."user" USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_user_email_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_user_email_unique" ON public."user" USING btree (email) WHERE (deleted_at IS NULL);


--
-- Name: IDX_user_id_64ff0c4c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_user_id_64ff0c4c" ON public.user_rbac_role USING btree (user_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_user_preference_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_user_preference_deleted_at" ON public.user_preference USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_user_preference_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_user_preference_user_id" ON public.user_preference USING btree (user_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_user_preference_user_id_key_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_user_preference_user_id_key_unique" ON public.user_preference USING btree (user_id, key) WHERE (deleted_at IS NULL);


--
-- Name: IDX_variant_id_17b4c4e35; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_variant_id_17b4c4e35" ON public.product_variant_inventory_item USING btree (variant_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_variant_id_52b23597; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_variant_id_52b23597" ON public.product_variant_price_set USING btree (variant_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_view_configuration_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_view_configuration_deleted_at" ON public.view_configuration USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_view_configuration_entity_is_system_default; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_view_configuration_entity_is_system_default" ON public.view_configuration USING btree (entity, is_system_default) WHERE (deleted_at IS NULL);


--
-- Name: IDX_view_configuration_entity_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_view_configuration_entity_user_id" ON public.view_configuration USING btree (entity, user_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_view_configuration_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_view_configuration_user_id" ON public.view_configuration USING btree (user_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_workflow_execution_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_workflow_execution_deleted_at" ON public.workflow_execution USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_workflow_execution_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_workflow_execution_id" ON public.workflow_execution USING btree (id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_workflow_execution_retention_time_updated_at_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_workflow_execution_retention_time_updated_at_state" ON public.workflow_execution USING btree (retention_time, updated_at, state) WHERE ((deleted_at IS NULL) AND (retention_time IS NOT NULL));


--
-- Name: IDX_workflow_execution_run_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_workflow_execution_run_id" ON public.workflow_execution USING btree (run_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_workflow_execution_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_workflow_execution_state" ON public.workflow_execution USING btree (state) WHERE (deleted_at IS NULL);


--
-- Name: IDX_workflow_execution_state_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_workflow_execution_state_updated_at" ON public.workflow_execution USING btree (state, updated_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_workflow_execution_transaction_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_workflow_execution_transaction_id" ON public.workflow_execution USING btree (transaction_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_workflow_execution_updated_at_retention_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_workflow_execution_updated_at_retention_time" ON public.workflow_execution USING btree (updated_at, retention_time) WHERE ((deleted_at IS NULL) AND (retention_time IS NOT NULL) AND ((state)::text = ANY ((ARRAY['done'::character varying, 'failed'::character varying, 'reverted'::character varying])::text[])));


--
-- Name: IDX_workflow_execution_workflow_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_workflow_execution_workflow_id" ON public.workflow_execution USING btree (workflow_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_workflow_execution_workflow_id_transaction_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_workflow_execution_workflow_id_transaction_id" ON public.workflow_execution USING btree (workflow_id, transaction_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_workflow_execution_workflow_id_transaction_id_run_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_workflow_execution_workflow_id_transaction_id_run_id_unique" ON public.workflow_execution USING btree (workflow_id, transaction_id, run_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_script_name_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_script_name_unique ON public.script_migrations USING btree (script_name);


--
-- Name: tax_rate_rule FK_tax_rate_rule_tax_rate_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_rate_rule
    ADD CONSTRAINT "FK_tax_rate_rule_tax_rate_id" FOREIGN KEY (tax_rate_id) REFERENCES public.tax_rate(id) ON DELETE CASCADE;


--
-- Name: tax_rate FK_tax_rate_tax_region_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_rate
    ADD CONSTRAINT "FK_tax_rate_tax_region_id" FOREIGN KEY (tax_region_id) REFERENCES public.tax_region(id) ON DELETE CASCADE;


--
-- Name: tax_region FK_tax_region_parent_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_region
    ADD CONSTRAINT "FK_tax_region_parent_id" FOREIGN KEY (parent_id) REFERENCES public.tax_region(id) ON DELETE CASCADE;


--
-- Name: tax_region FK_tax_region_provider_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_region
    ADD CONSTRAINT "FK_tax_region_provider_id" FOREIGN KEY (provider_id) REFERENCES public.tax_provider(id) ON DELETE SET NULL;


--
-- Name: application_method_buy_rules application_method_buy_rules_application_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_method_buy_rules
    ADD CONSTRAINT application_method_buy_rules_application_method_id_foreign FOREIGN KEY (application_method_id) REFERENCES public.promotion_application_method(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: application_method_buy_rules application_method_buy_rules_promotion_rule_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_method_buy_rules
    ADD CONSTRAINT application_method_buy_rules_promotion_rule_id_foreign FOREIGN KEY (promotion_rule_id) REFERENCES public.promotion_rule(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: application_method_target_rules application_method_target_rules_application_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_method_target_rules
    ADD CONSTRAINT application_method_target_rules_application_method_id_foreign FOREIGN KEY (application_method_id) REFERENCES public.promotion_application_method(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: application_method_target_rules application_method_target_rules_promotion_rule_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_method_target_rules
    ADD CONSTRAINT application_method_target_rules_promotion_rule_id_foreign FOREIGN KEY (promotion_rule_id) REFERENCES public.promotion_rule(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: auth_mfa_factor auth_mfa_factor_auth_identity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_mfa_factor
    ADD CONSTRAINT auth_mfa_factor_auth_identity_id_foreign FOREIGN KEY (auth_identity_id) REFERENCES public.auth_identity(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: auth_mfa_recovery_code auth_mfa_recovery_code_auth_identity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_mfa_recovery_code
    ADD CONSTRAINT auth_mfa_recovery_code_auth_identity_id_foreign FOREIGN KEY (auth_identity_id) REFERENCES public.auth_identity(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: auth_password_reset_token auth_password_reset_token_auth_identity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_password_reset_token
    ADD CONSTRAINT auth_password_reset_token_auth_identity_id_foreign FOREIGN KEY (auth_identity_id) REFERENCES public.auth_identity(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: auth_password_reset_token auth_password_reset_token_provider_identity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_password_reset_token
    ADD CONSTRAINT auth_password_reset_token_provider_identity_id_foreign FOREIGN KEY (provider_identity_id) REFERENCES public.provider_identity(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: auth_verification auth_verification_auth_identity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_verification
    ADD CONSTRAINT auth_verification_auth_identity_id_foreign FOREIGN KEY (auth_identity_id) REFERENCES public.auth_identity(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: capture capture_payment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capture
    ADD CONSTRAINT capture_payment_id_foreign FOREIGN KEY (payment_id) REFERENCES public.payment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart cart_billing_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_billing_address_id_foreign FOREIGN KEY (billing_address_id) REFERENCES public.cart_address(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cart_line_item_adjustment cart_line_item_adjustment_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_line_item_adjustment
    ADD CONSTRAINT cart_line_item_adjustment_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.cart_line_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart_line_item cart_line_item_cart_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_line_item
    ADD CONSTRAINT cart_line_item_cart_id_foreign FOREIGN KEY (cart_id) REFERENCES public.cart(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart_line_item_tax_line cart_line_item_tax_line_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_line_item_tax_line
    ADD CONSTRAINT cart_line_item_tax_line_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.cart_line_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart cart_shipping_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_shipping_address_id_foreign FOREIGN KEY (shipping_address_id) REFERENCES public.cart_address(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cart_shipping_method_adjustment cart_shipping_method_adjustment_shipping_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_shipping_method_adjustment
    ADD CONSTRAINT cart_shipping_method_adjustment_shipping_method_id_foreign FOREIGN KEY (shipping_method_id) REFERENCES public.cart_shipping_method(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart_shipping_method cart_shipping_method_cart_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_shipping_method
    ADD CONSTRAINT cart_shipping_method_cart_id_foreign FOREIGN KEY (cart_id) REFERENCES public.cart(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart_shipping_method_tax_line cart_shipping_method_tax_line_shipping_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_shipping_method_tax_line
    ADD CONSTRAINT cart_shipping_method_tax_line_shipping_method_id_foreign FOREIGN KEY (shipping_method_id) REFERENCES public.cart_shipping_method(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: composer_bank_account composer_bank_account_composer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.composer_bank_account
    ADD CONSTRAINT composer_bank_account_composer_id_foreign FOREIGN KEY (composer_id) REFERENCES public.composer(id) ON UPDATE CASCADE;


--
-- Name: credit_line credit_line_cart_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_line
    ADD CONSTRAINT credit_line_cart_id_foreign FOREIGN KEY (cart_id) REFERENCES public.cart(id) ON UPDATE CASCADE;


--
-- Name: customer_address customer_address_customer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_address
    ADD CONSTRAINT customer_address_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES public.customer(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_group_customer customer_group_customer_customer_group_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_group_customer
    ADD CONSTRAINT customer_group_customer_customer_group_id_foreign FOREIGN KEY (customer_group_id) REFERENCES public.customer_group(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_group_customer customer_group_customer_customer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_group_customer
    ADD CONSTRAINT customer_group_customer_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES public.customer(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fulfillment fulfillment_delivery_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fulfillment
    ADD CONSTRAINT fulfillment_delivery_address_id_foreign FOREIGN KEY (delivery_address_id) REFERENCES public.fulfillment_address(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: fulfillment_item fulfillment_item_fulfillment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fulfillment_item
    ADD CONSTRAINT fulfillment_item_fulfillment_id_foreign FOREIGN KEY (fulfillment_id) REFERENCES public.fulfillment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fulfillment_label fulfillment_label_fulfillment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fulfillment_label
    ADD CONSTRAINT fulfillment_label_fulfillment_id_foreign FOREIGN KEY (fulfillment_id) REFERENCES public.fulfillment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fulfillment fulfillment_provider_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fulfillment
    ADD CONSTRAINT fulfillment_provider_id_foreign FOREIGN KEY (provider_id) REFERENCES public.fulfillment_provider(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: fulfillment fulfillment_shipping_option_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fulfillment
    ADD CONSTRAINT fulfillment_shipping_option_id_foreign FOREIGN KEY (shipping_option_id) REFERENCES public.shipping_option(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: geo_zone geo_zone_service_zone_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.geo_zone
    ADD CONSTRAINT geo_zone_service_zone_id_foreign FOREIGN KEY (service_zone_id) REFERENCES public.service_zone(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: image image_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventory_level inventory_level_inventory_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_level
    ADD CONSTRAINT inventory_level_inventory_item_id_foreign FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification notification_provider_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_provider_id_foreign FOREIGN KEY (provider_id) REFERENCES public.notification_provider(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order order_billing_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_billing_address_id_foreign FOREIGN KEY (billing_address_id) REFERENCES public.order_address(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_change_action order_change_action_order_change_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_change_action
    ADD CONSTRAINT order_change_action_order_change_id_foreign FOREIGN KEY (order_change_id) REFERENCES public.order_change(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_change order_change_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_change
    ADD CONSTRAINT order_change_order_id_foreign FOREIGN KEY (order_id) REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_credit_line order_credit_line_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_credit_line
    ADD CONSTRAINT order_credit_line_order_id_foreign FOREIGN KEY (order_id) REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_item order_item_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.order_line_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_item order_item_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_order_id_foreign FOREIGN KEY (order_id) REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_line_item_adjustment order_line_item_adjustment_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_line_item_adjustment
    ADD CONSTRAINT order_line_item_adjustment_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.order_line_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_line_item_tax_line order_line_item_tax_line_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_line_item_tax_line
    ADD CONSTRAINT order_line_item_tax_line_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.order_line_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_line_item order_line_item_totals_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_line_item
    ADD CONSTRAINT order_line_item_totals_id_foreign FOREIGN KEY (totals_id) REFERENCES public.order_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order order_shipping_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_shipping_address_id_foreign FOREIGN KEY (shipping_address_id) REFERENCES public.order_address(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_shipping_method_adjustment order_shipping_method_adjustment_shipping_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_shipping_method_adjustment
    ADD CONSTRAINT order_shipping_method_adjustment_shipping_method_id_foreign FOREIGN KEY (shipping_method_id) REFERENCES public.order_shipping_method(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_shipping_method_tax_line order_shipping_method_tax_line_shipping_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_shipping_method_tax_line
    ADD CONSTRAINT order_shipping_method_tax_line_shipping_method_id_foreign FOREIGN KEY (shipping_method_id) REFERENCES public.order_shipping_method(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_shipping order_shipping_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_shipping
    ADD CONSTRAINT order_shipping_order_id_foreign FOREIGN KEY (order_id) REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_summary order_summary_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_summary
    ADD CONSTRAINT order_summary_order_id_foreign FOREIGN KEY (order_id) REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_transaction order_transaction_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_transaction
    ADD CONSTRAINT order_transaction_order_id_foreign FOREIGN KEY (order_id) REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment_collection_payment_providers payment_collection_payment_providers_payment_col_aa276_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_collection_payment_providers
    ADD CONSTRAINT payment_collection_payment_providers_payment_col_aa276_foreign FOREIGN KEY (payment_collection_id) REFERENCES public.payment_collection(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment_collection_payment_providers payment_collection_payment_providers_payment_pro_2d555_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_collection_payment_providers
    ADD CONSTRAINT payment_collection_payment_providers_payment_pro_2d555_foreign FOREIGN KEY (payment_provider_id) REFERENCES public.payment_provider(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment payment_payment_collection_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_payment_collection_id_foreign FOREIGN KEY (payment_collection_id) REFERENCES public.payment_collection(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment_session payment_session_payment_collection_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_session
    ADD CONSTRAINT payment_session_payment_collection_id_foreign FOREIGN KEY (payment_collection_id) REFERENCES public.payment_collection(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payout_item payout_item_batch_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payout_item
    ADD CONSTRAINT payout_item_batch_id_foreign FOREIGN KEY (batch_id) REFERENCES public.payout_batch(id) ON UPDATE CASCADE;


--
-- Name: price_list_rule price_list_rule_price_list_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_list_rule
    ADD CONSTRAINT price_list_rule_price_list_id_foreign FOREIGN KEY (price_list_id) REFERENCES public.price_list(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price price_price_list_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price
    ADD CONSTRAINT price_price_list_id_foreign FOREIGN KEY (price_list_id) REFERENCES public.price_list(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price price_price_set_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price
    ADD CONSTRAINT price_price_set_id_foreign FOREIGN KEY (price_set_id) REFERENCES public.price_set(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price_rule price_rule_price_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_rule
    ADD CONSTRAINT price_rule_price_id_foreign FOREIGN KEY (price_id) REFERENCES public.price(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_category product_category_parent_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_category
    ADD CONSTRAINT product_category_parent_category_id_foreign FOREIGN KEY (parent_category_id) REFERENCES public.product_category(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_category_product product_category_product_product_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_category_product
    ADD CONSTRAINT product_category_product_product_category_id_foreign FOREIGN KEY (product_category_id) REFERENCES public.product_category(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_category_product product_category_product_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_category_product
    ADD CONSTRAINT product_category_product_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product product_collection_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_collection_id_foreign FOREIGN KEY (collection_id) REFERENCES public.product_collection(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_option_value product_option_value_option_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_option_value
    ADD CONSTRAINT product_option_value_option_id_foreign FOREIGN KEY (option_id) REFERENCES public.product_option(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_product_option product_product_option_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_product_option
    ADD CONSTRAINT product_product_option_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_product_option product_product_option_product_option_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_product_option
    ADD CONSTRAINT product_product_option_product_option_id_foreign FOREIGN KEY (product_option_id) REFERENCES public.product_option(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_product_option_value product_product_option_value_product_option_value_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_product_option_value
    ADD CONSTRAINT product_product_option_value_product_option_value_id_foreign FOREIGN KEY (product_option_value_id) REFERENCES public.product_option_value(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_product_option_value product_product_option_value_product_product_option_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_product_option_value
    ADD CONSTRAINT product_product_option_value_product_product_option_id_foreign FOREIGN KEY (product_product_option_id) REFERENCES public.product_product_option(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_tags product_tags_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_tags product_tags_product_tag_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_product_tag_id_foreign FOREIGN KEY (product_tag_id) REFERENCES public.product_tag(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product product_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_type_id_foreign FOREIGN KEY (type_id) REFERENCES public.product_type(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_variant_option product_variant_option_option_value_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variant_option
    ADD CONSTRAINT product_variant_option_option_value_id_foreign FOREIGN KEY (option_value_id) REFERENCES public.product_option_value(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variant_option product_variant_option_variant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variant_option
    ADD CONSTRAINT product_variant_option_variant_id_foreign FOREIGN KEY (variant_id) REFERENCES public.product_variant(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variant product_variant_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variant
    ADD CONSTRAINT product_variant_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variant_product_image product_variant_product_image_image_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variant_product_image
    ADD CONSTRAINT product_variant_product_image_image_id_foreign FOREIGN KEY (image_id) REFERENCES public.image(id) ON DELETE CASCADE;


--
-- Name: promotion_application_method promotion_application_method_promotion_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_application_method
    ADD CONSTRAINT promotion_application_method_promotion_id_foreign FOREIGN KEY (promotion_id) REFERENCES public.promotion(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion_campaign_budget promotion_campaign_budget_campaign_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_campaign_budget
    ADD CONSTRAINT promotion_campaign_budget_campaign_id_foreign FOREIGN KEY (campaign_id) REFERENCES public.promotion_campaign(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion_campaign_budget_usage promotion_campaign_budget_usage_budget_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_campaign_budget_usage
    ADD CONSTRAINT promotion_campaign_budget_usage_budget_id_foreign FOREIGN KEY (budget_id) REFERENCES public.promotion_campaign_budget(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion promotion_campaign_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion
    ADD CONSTRAINT promotion_campaign_id_foreign FOREIGN KEY (campaign_id) REFERENCES public.promotion_campaign(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: promotion_promotion_rule promotion_promotion_rule_promotion_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_promotion_rule
    ADD CONSTRAINT promotion_promotion_rule_promotion_id_foreign FOREIGN KEY (promotion_id) REFERENCES public.promotion(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion_promotion_rule promotion_promotion_rule_promotion_rule_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_promotion_rule
    ADD CONSTRAINT promotion_promotion_rule_promotion_rule_id_foreign FOREIGN KEY (promotion_rule_id) REFERENCES public.promotion_rule(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion_rule_value promotion_rule_value_promotion_rule_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_rule_value
    ADD CONSTRAINT promotion_rule_value_promotion_rule_id_foreign FOREIGN KEY (promotion_rule_id) REFERENCES public.promotion_rule(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: provider_identity provider_identity_auth_identity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_identity
    ADD CONSTRAINT provider_identity_auth_identity_id_foreign FOREIGN KEY (auth_identity_id) REFERENCES public.auth_identity(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: refund refund_payment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refund
    ADD CONSTRAINT refund_payment_id_foreign FOREIGN KEY (payment_id) REFERENCES public.payment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: region_country region_country_region_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.region_country
    ADD CONSTRAINT region_country_region_id_foreign FOREIGN KEY (region_id) REFERENCES public.region(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reservation_item reservation_item_inventory_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservation_item
    ADD CONSTRAINT reservation_item_inventory_item_id_foreign FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: return_reason return_reason_parent_return_reason_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.return_reason
    ADD CONSTRAINT return_reason_parent_return_reason_id_foreign FOREIGN KEY (parent_return_reason_id) REFERENCES public.return_reason(id);


--
-- Name: service_zone service_zone_fulfillment_set_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_zone
    ADD CONSTRAINT service_zone_fulfillment_set_id_foreign FOREIGN KEY (fulfillment_set_id) REFERENCES public.fulfillment_set(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shipping_option shipping_option_provider_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_option
    ADD CONSTRAINT shipping_option_provider_id_foreign FOREIGN KEY (provider_id) REFERENCES public.fulfillment_provider(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: shipping_option_rule shipping_option_rule_shipping_option_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_option_rule
    ADD CONSTRAINT shipping_option_rule_shipping_option_id_foreign FOREIGN KEY (shipping_option_id) REFERENCES public.shipping_option(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shipping_option shipping_option_service_zone_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_option
    ADD CONSTRAINT shipping_option_service_zone_id_foreign FOREIGN KEY (service_zone_id) REFERENCES public.service_zone(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shipping_option shipping_option_shipping_option_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_option
    ADD CONSTRAINT shipping_option_shipping_option_type_id_foreign FOREIGN KEY (shipping_option_type_id) REFERENCES public.shipping_option_type(id) ON UPDATE CASCADE;


--
-- Name: shipping_option shipping_option_shipping_profile_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_option
    ADD CONSTRAINT shipping_option_shipping_profile_id_foreign FOREIGN KEY (shipping_profile_id) REFERENCES public.shipping_profile(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stock_location stock_location_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_location
    ADD CONSTRAINT stock_location_address_id_foreign FOREIGN KEY (address_id) REFERENCES public.stock_location_address(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: store_currency store_currency_store_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_currency
    ADD CONSTRAINT store_currency_store_id_foreign FOREIGN KEY (store_id) REFERENCES public.store(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: store_locale store_locale_store_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_locale
    ADD CONSTRAINT store_locale_store_id_foreign FOREIGN KEY (store_id) REFERENCES public.store(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

