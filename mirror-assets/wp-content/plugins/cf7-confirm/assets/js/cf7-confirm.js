/**
 * CF7 Confirm フロントスクリプト（強制横取り版）
 *
 * 前回のバージョンで「送信ボタン押すとメールが届いちゃう」問題が出たので、
 * submit横取りをより強力にする：
 * 1. form の action を完全に空にする（通常POSTで飛ばせなくする）
 * 2. form の onsubmit を上書き
 * 3. submit ボタンの click でも横取り
 * 4. capture phase で submit をブロック
 */
( function ( $ ) {
	'use strict';

	// 早めに実行したいので DOMContentLoaded を待つが、できるだけ早く
	function init() {
		var forms = document.querySelectorAll( 'form.wpcf7-form' );
		forms.forEach( function ( formEl ) {
			var $form            = $( formEl );
			var $confirmUrlInput = $form.find( 'input[name="_cf7_confirm_url"]' );

			if ( $confirmUrlInput.length === 0 || ! $confirmUrlInput.val() ) {
				return;
			}

			console.log( '[CF7 Confirm] hooking form:', formEl );

			// --- 防御策1：actionを退避して空にする ---
			// こうすると通常POSTで飛んでも wp-admin にPOSTされないで済む
			var originalAction = formEl.getAttribute( 'action' );
			formEl.setAttribute( 'data-original-action', originalAction );
			formEl.setAttribute( 'action', 'javascript:void(0);' );

			// --- 防御策2：onsubmit属性を上書き ---
			formEl.onsubmit = function ( e ) {
				if ( e ) {
					e.preventDefault();
					e.stopPropagation();
				}
				submitForValidation( $form );
				return false;
			};

			// --- 防御策3：submitイベント（capture phase）で横取り ---
			formEl.addEventListener( 'submit', function ( e ) {
				e.preventDefault();
				e.stopImmediatePropagation();
				e.stopPropagation();
				submitForValidation( $form );
				return false;
			}, true ); // capture = true

			// --- 防御策4：submitボタン click 横取り ---
			$form.on( 'click', 'input[type="submit"], button[type="submit"], .wpcf7-submit', function ( e ) {
				e.preventDefault();
				e.stopImmediatePropagation();
				e.stopPropagation();
				submitForValidation( $form );
				return false;
			} );
		} );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}

	function submitForValidation( $form ) {
		console.log( '[CF7 Confirm] submitForValidation start' );

		// エラー表示クリア
		$form.find( '.wpcf7-not-valid-tip' ).remove();
		$form.find( '.wpcf7-not-valid' ).removeClass( 'wpcf7-not-valid' );
		$form.find( '.wpcf7-response-output' )
			.empty()
			.removeClass( 'wpcf7-validation-errors wpcf7-mail-sent-ok wpcf7-mail-sent-ng' );

		var formData = new FormData( $form[ 0 ] );

		// REST APIエンドポイントへPOST
		fetch( '/wp-json/cf7-confirm/v1/validate', {
			method:      'POST',
			body:        formData,
			credentials: 'same-origin',
			headers: {
				'Accept': 'application/json',
			},
		} ).then( function ( res ) {
			return res.json().then( function ( data ) {
				return { status: res.status, body: data };
			} );
		} ).then( function ( result ) {
			console.log( '[CF7 Confirm] validate response:', result );

			var body = result.body || {};

			if ( body.status === 'validation_failed' ) {
				showValidationErrors( $form, body );
				return;
			}

			if ( body.status === 'validation_success' && body.redirect_url ) {
				window.location.href = body.redirect_url;
				return;
			}

			$form.find( '.wpcf7-response-output' )
				.text( body.message || '送信エラーが発生しました。' )
				.addClass( 'wpcf7-validation-errors' );
		} ).catch( function ( err ) {
			console.error( '[CF7 Confirm] fetch error:', err );
			$form.find( '.wpcf7-response-output' )
				.text( '通信エラーが発生しました。' )
				.addClass( 'wpcf7-validation-errors' );
		} );
	}

	function showValidationErrors( $form, body ) {
		if ( body.invalid_fields && body.invalid_fields.length ) {
			body.invalid_fields.forEach( function ( field ) {
				var $wrap = $form.find( field.into );
				$wrap.addClass( 'wpcf7-not-valid' );
				var $target = $wrap.find( 'input, select, textarea' ).first();
				$target.addClass( 'wpcf7-not-valid' )
					.attr( 'aria-invalid', 'true' );
				$wrap.append(
					'<span class="wpcf7-not-valid-tip" role="alert">' +
						field.message +
					'</span>'
				);
			} );
		}
		$form.find( '.wpcf7-response-output' )
			.text( body.message || '入力内容に誤りがあります。' )
			.addClass( 'wpcf7-validation-errors' );
	}

	// ============================================
	// 確認画面：送信ボタン
	// ============================================
	$( function () {
		$( document ).on( 'click', '.cf7-confirm-submit', function () {
			var $btn    = $( this );
			var formId  = $btn.data( 'form-id' );
			var token   = $btn.data( 'token' );
			// loadingは任意。存在しなくても動くように
			var $loader = $( '.cf7-confirm-loading' ).first();

			$btn.prop( 'disabled', true );
			if ( $loader.length ) {
				$loader.show();
			}

			$.ajax( {
				url:    cf7ConfirmData.ajaxUrl,
				method: 'POST',
				data: {
					action:  'cf7_confirm_send',
					form_id: formId,
					token:   token,
					nonce:   cf7ConfirmData.nonce,
				},
			} ).done( function ( res ) {
				if ( res.success && res.data.redirect ) {
					window.location.href = res.data.redirect;
				} else {
					alert( ( res.data && res.data.message ) || '送信に失敗しました。' );
					$btn.prop( 'disabled', false );
					if ( $loader.length ) { $loader.hide(); }
				}
			} ).fail( function () {
				alert( '通信エラーが発生しました。' );
				$btn.prop( 'disabled', false );
				if ( $loader.length ) { $loader.hide(); }
			} );
		} );
	} );
} )( jQuery );
