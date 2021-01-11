<template>
	<div>
		<div id="toolbar-container"></div>
		<div id="editor">
			<p>This is some sample content.</p>
		</div>
		<div @click="showElement">12334</div>
		<div id="test"></div>
	</div>
</template>

<script>
import Vue from 'Vue'
import ClassicEditor from '@ckeditor/ckeditor5-build-decoupled-document';
// import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
// import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
// import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
// import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
// import Image from '@ckeditor/ckeditor5-image/src/image';
// import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
let EDITOR = null;
export default {
    name: '',
    data() {
      return {};
    },
    methods: {
			showElement() {
				
				console.log(EDITOR.getData())
				document.querySelector('#test').appendChild(document.querySelector( '#editor' ))
			}
		},
    computed: {
        // 计算属性
    },
    watch: {
        // 监听属性
    },
    created() {
			// console.log('created函数......');
			// Vue.use(BalloonEditor)
    },
    mounted() {
			ClassicEditor
        .create( document.querySelector( '#editor' ), {
					// plugins: [ Image, ImageResize],
					// plugins: [ Essentials, Paragraph, Bold, Italic ],
					extraPlugins: [ MyCustomUploadAdapterPlugin ],
					// toolbar: [ 'bold', 'italic' ]
					// image: {
					// 	resizeUnit: "%",
					// 	resizeOptions: [ {
					// 		name: 'imageResize:original',
					// 		value: null
					// 	},
					// 	{
					// 		name: 'imageResize:50',
					// 		value: '50'
					// 	},
					// 	{
					// 		name: 'imageResize:75',
					// 		value: '75'
					// 	} ],
						// toolbar: [ 'imageStyle:alignLeft', 'imageStyle:alignCenter', 'imageStyle:alignRight',
            //     '|',
            //     'imageResize',
            //     '|',
            //     'imageTextAlternative']
					// }
					// ckfinder: {
					// 	uploadUrl: 'http://192.168.10.43:8081/static'
					// }
				})
        .then( editor => {
					EDITOR = editor;
					console.log(editor)
            const toolbarContainer = document.querySelector( '#toolbar-container' );

						toolbarContainer.appendChild( editor.ui.view.toolbar.element );
						// document.body.appendChild( editor.ui.view.toolbar.element );
        } )
        .catch( error => {
            console.error( error );
				} );
		}
};
function MyCustomUploadAdapterPlugin( editor ) {
    editor.plugins.get( 'FileRepository' ).createUploadAdapter = ( loader ) => {
        // Configure the URL to the upload script in your back-end here!
        return new MyUploadAdapter( loader );
    };
}
class MyUploadAdapter {
    constructor( loader ) {
        // The file loader instance to use during the upload.
        this.loader = loader;
    }

    // Starts the upload process.
    upload() {
        return this.loader.file
            .then( file => new Promise( ( resolve, reject ) => {
							console.log(file);
							resolve({default: '../../static/测试图.png'})
                // this._initRequest();s
                // this._initListeners( resolve, reject, file );
                // this._sendRequest( file );
            } ) );
    }

    // Aborts the upload process.
    abort() {
        if ( this.xhr ) {
            this.xhr.abort();
        }
    }

    // Initializes the XMLHttpRequest object using the URL passed to the constructor.
    _initRequest() {
        const xhr = this.xhr = new XMLHttpRequest();

        // Note that your request may look different. It is up to you and your editor
        // integration to choose the right communication channel. This example uses
        // a POST request with JSON as a data structure but your configuration
        // could be different.
        xhr.open( 'POST', 'http://example.com/image/upload/path', true );
        xhr.responseType = 'json';
    }

    // Initializes XMLHttpRequest listeners.
    _initListeners( resolve, reject, file ) {
        const xhr = this.xhr;
        const loader = this.loader;
        const genericErrorText = `Couldn't upload file: ${ file.name }.`;

        xhr.addEventListener( 'error', () => reject( genericErrorText ) );
        xhr.addEventListener( 'abort', () => reject() );
        xhr.addEventListener( 'load', () => {
            const response = xhr.response;

            // This example assumes the XHR server's "response" object will come with
            // an "error" which has its own "message" that can be passed to reject()
            // in the upload promise.
            //
            // Your integration may handle upload errors in a different way so make sure
            // it is done properly. The reject() function must be called when the upload fails.
            if ( !response || response.error ) {
                return reject( response && response.error ? response.error.message : genericErrorText );
            }

            // If the upload is successful, resolve the upload promise with an object containing
            // at least the "default" URL, pointing to the image on the server.
            // This URL will be used to display the image in the content. Learn more in the
            // UploadAdapter#upload documentation.
            resolve( {
                default: response.url
            } );
        } );

        // Upload progress when it is supported. The file loader has the #uploadTotal and #uploaded
        // properties which are used e.g. to display the upload progress bar in the editor
        // user interface.
        if ( xhr.upload ) {
            xhr.upload.addEventListener( 'progress', evt => {
                if ( evt.lengthComputable ) {
                    loader.uploadTotal = evt.total;
                    loader.uploaded = evt.loaded;
                }
            } );
        }
    }

    // Prepares the data and sends the request.
    _sendRequest( file ) {
        // Prepare the form data.
        const data = new FormData();

        data.append( 'upload', file );

        // Important note: This is the right place to implement security mechanisms
        // like authentication and CSRF protection. For instance, you can use
        // XMLHttpRequest.setRequestHeader() to set the request headers containing
        // the CSRF token generated earlier by your application.

        // Send the request.
        this.xhr.send( data );
    }
}
</script>

<style scoped>
div {
	/* width: 100px;
	height: 100px; */
}
</style>
