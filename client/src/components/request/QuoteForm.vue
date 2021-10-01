<template>
  <v-container>
    <v-row justify="center">
        <v-dialog
        v-model="dialog"
        max-width="380"
        >
        <v-card>
            <v-card-title class="text-h6">
            Recaptcha
            </v-card-title>

            <vue-recaptcha class="recaptcha_style" @verify="verifyCallback" sitekey="6LcLc5kcAAAAAC9YNLY8IEMz3Q44GewMMHoNSiwS" :loadRecaptchaScript="true"></vue-recaptcha>
            <v-card-actions>
                <v-spacer></v-spacer>
            </v-card-actions>    
        </v-card>
        </v-dialog>
    </v-row>  
    <v-row class="text-center">
        <v-col cols="8" class="offset-2">
              <v-form
                ref="form"
                v-model="valid"
                lazy-validation
              >
                <v-text-field
                v-model="company"
                :counter="40"
                :rules="companyRules"
                label="Company(*)"
                outlined
                required
                ></v-text-field>

                <v-text-field
                v-model="name"
                :counter="20"
                :rules="nameRules"
                label="Your Name(*)"
                outlined
                required
                ></v-text-field>

                <v-text-field
                v-model="email"
                :rules="emailRules"
                label="E-mail(*)"
                outlined
                required
                ></v-text-field>

                <vue-phone-number-input id="phone_number" v-model="phone" size="lg"/>

                <v-row>
                     <v-col cols="12" class="col-lg-6 col-sm-12">
                         <vue-dropzone ref="dropzoneQuoteOptions" id="dropzoneQuoteOptions" v-on:vdropzone-success="quoteFileUploadSuccess" class="dropzone" :options="dropzoneQuoteOptions"></vue-dropzone>
                          <v-alert
                            dense
                            outlined
                            type="error"
                            class="mt-2"
                            v-if="isDrawingFileNotUploaded"
                            >
                            upload drawings or art files that you want to quoted is required
                            </v-alert>
                     </v-col>
                     <v-col cols="12" class="col-lg-6 col-sm-12">
                         <vue-dropzone ref="dropzoneRFQOptions" id="dropzoneRFQOptions" v-on:vdropzone-success="requirementRFQSuccess" class="dropzone" :options="dropzoneRFQOptions"></vue-dropzone>
                     </v-col>
                </v-row>

                <v-row>
                    <v-col cols="12" class="mt-5 text-center">
                        <v-btn
                        :disabled="!valid"
                        color="success"
                        class="mr-4"
                        @click="validate"
                        >
                        Submit
                        </v-btn>

                        <v-btn
                        color="error"
                        class="mr-4"
                        @click="reset"
                        >
                        Reset
                        </v-btn>
                    </v-col>
                </v-row>
            </v-form>
        </v-col>   
    </v-row>
  </v-container>
</template>

<script>
  import VuePhoneNumberInput from 'vue-phone-number-input';
  import '../../../custom/css/vue-phone-number-input.css';
  import vue2Dropzone from 'vue2-dropzone'
  import '../../../custom/css/vue2Dropzone.min.css'
  import VueRecaptcha from 'vue-recaptcha';

  export default {
    name: 'QuoteForm',
    components: {
        VuePhoneNumberInput,
        vueDropzone: vue2Dropzone,
        VueRecaptcha 
    },
    data: () => ({
        dialog: false,
        valid: true,
        company: '',
        companyRules: [
            v => !!v || 'Company is required',
            v => (v && v.length <= 40) || 'Company must be less than 10 characters',
        ],
        name: '',
        nameRules: [
            v => !!v || 'Name is required',
            v => (v && v.length <= 20) || 'Name must be less than 10 characters',
        ],
        email: '',
        emailRules: [
            v => !!v || 'E-mail is required',
            v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
        ],
        phone: '',
        isDrawingFileNotUploaded: false,
        recapchaToken: null,
        dropzoneQouteFiles: [],
        dropzoneQuoteOptions: {
            url: 'http://localhost:4000/upload',
            thumbnailWidth: 75,
            maxFilesize: 100,
            autoProcessQueue: false,
            acceptedFiles: '.step,.stp,.sldprt,.stl,.dxf,.ipt,.x_t,.x_b,.3mf,.3dxml,.catpart,.prt,.sat,.pdf',
            headers: { "My-Awesome-Header": "header value" },
            dictDefaultMessage: "<i class='fa fa-cloud-upload'></i> Upload drawings or part files that you want to quoted. <br/><strong>Allowed file-types:</strong> STEP, STP, SLDPRT, STL, DXF, IPT, X_T, X_B, 3MF, 3DXML, CATPART, PRT, SAT, PDF",
            init: function() {    
                this.on("complete", 
                    function(file) { 
                        console.log(file)
                    }
                );
            }
        },
        dropzoneRFQOptions: {
            url: 'http://localhost:4000/upload',
            thumbnailWidth: 75,
            maxFilesize: 100,
            autoProcessQueue: false,
            acceptedFiles: '.pdf,.docx,.doc,.xlsx,.xls,.csv',
            headers: { "My-Awesome-Header": "header value" },
            dictDefaultMessage: "<i class='fa fa-cloud-upload'></i> If you have an RFQ file or any project specifications, upload them here. <br/><strong>Allowed file-types:</strong> PDF, DOCX, DOC, XLSX, XLS, CSV",
            init: function() {    
                this.on("complete", 
                    function(file) { 
                        console.log(file)
                    }
                );
            }
        }
    }),
    mounted: () => {

    },
    methods: {
        validate () {
            if(this.$refs.dropzoneQuoteOptions.dropzone.files.length == 0){
                this.isDrawingFileNotUploaded = true
            }
            this.$refs.form.validate()
            if(this.$refs.form.validate() && !this.isDrawingFileNotUploaded){
                this.dialog = true 
            }
        },
        reset () {
            this.isDrawingFileNotUploaded = false
            this.$refs.dropzoneQuoteOptions.removeAllFiles()
            this.$refs.dropzoneRFQOptions.removeAllFiles()
            this.$refs.form.reset()
        },
        quoteFileUploadSuccess(file, response){
            console.log(file, response)
        },
        requirementRFQSuccess(file, response){
            console.log(file, response)
        },
        verifyCallback(response){
            if(response) {
                this.recapchaToken = response
                this.dialog = false
                this.$refs.dropzoneQuoteOptions.processQueue()
                this.$refs.dropzoneRFQOptions.processQueue()
                console.log('Form submitted')
            }
        }
    },
  }
</script>

<style scoped>
    @import url("https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css");
    #phone_number {
        min-height: 56px;
        margin-bottom: 30px;
    }
    .dropzone{
        min-height: 200px;
    }
    .recaptcha_style, #recatcha_alert_msg{
        width: 304px;
        margin: 25px auto;
    }
</style>
