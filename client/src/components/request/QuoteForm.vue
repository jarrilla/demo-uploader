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
                <vue-recaptcha class="recaptcha_style" ref="recaptcha" @verify="verifyCallback" :sitekey="sitekey" :loadRecaptchaScript="true"></vue-recaptcha>
                <v-card-actions>
                    <v-spacer></v-spacer>
                </v-card-actions>    
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="isLoading"
            persistent
            width="300"
            >
            <v-card
                color="primary"
                dark
            >
                <v-card-text>
                Loading ...
                <v-progress-linear
                    indeterminate
                    color="white"
                    class="mb-0"
                ></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-dialog
        v-model="isSuccess"
        persistent
        max-width="290"
        >
        <v-card>
            <v-card-text class="pt-15 text-center">
                <strong>RFQ Submitted</strong>
            </v-card-text>

            <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
                color="green darken-1"
                text
                @click="reset"
            >
                Okay
            </v-btn>
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

                <vue-phone-number-input id="phone_number" @update="onUpdate" v-model="phone" size="lg"/>
                <v-alert
                            dense
                            outlined
                            type="error"
                            class="mt-2 text-left"
                            v-if="!isPhoneNoValid"
                            >
                            phone no is invalid according to selected country
                </v-alert>

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
                        color="primary"
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
  let self;
  import CONSTANT from '../../../constant'
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
    created: function () {
        self = this;
    },
    data: () => ({
        sitekey: CONSTANT.GOOGLE_CAPTCHA_SITE_KEY,
        dialog: false,
        valid: true,
        isLoading: false,
        isSuccess: false,
        company: '',
        personalInfoID: '',
        companyRules: [
            v => !!v || 'Company is required',
        ],
        name: '',
        nameRules: [
            v => !!v || 'Name is required',
        ],
        email: '',
        emailRules: [
            v => !!v || 'E-mail is required',
            v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
        ],
        phoneDetails: {},
        isPhoneNoValid: true,
        phone: '',
        isDrawingFileNotUploaded: false,
        recapchaToken: null,
        dropzoneQouteFiles: [],
        dropzoneQuoteOptions: {
            url: 'url',
            thumbnailWidth: 75,
            maxFilesize: 100,
            autoProcessQueue: false,
            acceptedFiles: '.step,.stp,.sldprt,.stl,.dxf,.ipt,.x_t,.x_b,.3mf,.3dxml,.catpart,.prt,.sat,.pdf',
            headers: {
            },
            addRemoveLinks: true,
            dictDefaultMessage: "<i class='fa fa-cloud-upload'></i> Upload drawings or part files that you want quoted. <br/><strong>Allowed file-types:</strong> STEP, STP, SLDPRT, STL, DXF, IPT, X_T, X_B, 3MF, 3DXML, CATPART, PRT, SAT, PDF",
            init: function() {
                this.on("processing", function (file) {
                    self.$refs.dropzoneQuoteOptions.setOption('url', `${CONSTANT.API_URL}/upload/${self.personalInfoID}/part-file`);
                });
                this.on("addedfile", 
                    function(file) { 
                        self.isDrawingFileNotUploaded = false
                    }
                );    
                this.on("complete", 
                    function(file) { 
                        if(self.quoteFileCount === self.$refs.dropzoneQuoteOptions.dropzone.files.length && self.rfqFileCount === self.$refs.dropzoneRFQOptions.dropzone.files.length){
                            self.isLoading = false 
                            self.isSuccess = true 
                        }
                        console.log(file)
                    }
                );
            }
        },
        quoteFileCount: 0,
        rfqFileCount: 0,
        dropzoneRFQOptions: {
            url: 'url',
            thumbnailWidth: 75,
            maxFilesize: 100,
            autoProcessQueue: false,
            acceptedFiles: '.pdf,.docx,.doc,.xlsx,.xls,.csv',
            headers: {
                
            },
            addRemoveLinks: true,
            dictDefaultMessage: "<i class='fa fa-cloud-upload'></i> If you have an RFQ file or any project specifications, upload them here. <br/><strong>Allowed file-types:</strong> PDF, DOCX, DOC, XLSX, XLS, CSV",
            init: function() { 
                this.on("processing", function (file) {     
                    self.$refs.dropzoneRFQOptions.setOption('url', `${CONSTANT.API_URL}/upload/${self.personalInfoID}/project-specification`);
                });
                this.on("complete", 
                    function(file) { 
                        if(self.quoteFileCount === self.$refs.dropzoneQuoteOptions.dropzone.files.length && self.rfqFileCount === self.$refs.dropzoneRFQOptions.dropzone.files.length){
                            self.isLoading = false 
                            self.isSuccess = true 
                        }
                        console.log(file)
                    }
                );
            }
        }
    }),
    mounted: () => {

    },
    methods: {
        onUpdate: function(payload) {
            this.phoneDetails = payload;
            if(this.phoneDetails.isValid){
                this.isPhoneNoValid = true
            }
        },
        validate () {
            if(this.$refs.dropzoneQuoteOptions.dropzone.files.length == 0){
                this.isDrawingFileNotUploaded = true
            }
            if(this.phone){
                if(!this.phoneDetails.isValid){
                    this.isPhoneNoValid = false
                }
            }

            this.$refs.form.validate()
            if(this.$refs.form.validate() && !this.isDrawingFileNotUploaded &&  this.isPhoneNoValid){
                this.dialog = true 
            }
        },
        reset () {
            this.isLoading = false
            this.isSuccess = false
            this.isDrawingFileNotUploaded = false
            this.phone = ''
            this.phoneDetails = {}
            if(this.recapchaToken){
                this.$refs.recaptcha.reset()
            }
            this.$refs.dropzoneQuoteOptions.removeAllFiles()
            this.$refs.dropzoneRFQOptions.removeAllFiles()
            this.$refs.form.reset()
        },
        quoteFileUploadSuccess(file, response){
            this.quoteFileCount += 1
        },
        requirementRFQSuccess(file, response){
            this.rfqFileCount += 1
        },
        async verifyCallback(response){
            if(response) {
                const personalData = {
                    company: this.company.toLowerCase(), 
                    name: this.name.toLowerCase(), 
                    email: this.email.toLowerCase(), 
                    phone: '('+this.phoneDetails.countryCallingCode+')'+this.phone,
                    token: response
                }

                const rawResponse = await fetch(`${CONSTANT.API_URL}/personal-info`, {
                    method: 'POST',
                    headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(personalData)
                });

                const personalInfoResponse = await rawResponse.json();
                if(personalInfoResponse.success){
                    this.personalInfoID = personalInfoResponse.data.id
                    this.recapchaToken = response
                    this.dialog = false
                    this.isLoading = true
                    this.$refs.dropzoneQuoteOptions.processQueue()
                    this.$refs.dropzoneRFQOptions.processQueue()
                }else{
                    this.reset()
                }
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
        height: 500px;
        overflow-y: scroll;
    }
    .recaptcha_style, #recatcha_alert_msg{
        width: 304px;
        margin: 25px auto;
    }
</style>
