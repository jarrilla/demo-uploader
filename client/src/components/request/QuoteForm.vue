<template>
  <v-container>
    <v-row justify="center">
      <v-dialog v-model="dialog" max-width="380">
        <v-card>
          <v-card-title class="text-h6">
            Recaptcha
          </v-card-title>
          <vue-recaptcha
            class="recaptcha_style"
            ref="recaptcha"
            @verify="verifyCallback"
            :sitekey="sitekey"
            :loadRecaptchaScript="true"
          ></vue-recaptcha>
          <v-card-actions>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>
        <v-dialog v-model='isCreatingRFQ' persistent width='250'>
            <v-card color="success" dark>
                <v-card-text>
                Creating RFQ ...
                <v-progress-linear
                    indeterminate
                    color="white"
                    class="mb-0"
                ></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>

      <v-dialog v-model="isLoading" persistent width="250">
        <v-card color="primary" dark>
          <v-card-text>
            Uploading Files ...
            <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
            ></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog v-model="isSuccess" persistent max-width="300">
        <v-card>
          <v-card-text class="pt-15 text-center">
            <strong>Thank you for your request!</strong>
            <p>You should receive a follow-up email soon.</p>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn color="green darken-1" text @click="reset">
              Okay
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="isError.status" persistent max-width="290">
        <v-card>
          <v-card-text class="pt-15 text-center">
            <p v-for="(errorMessage, index) in isError.errors" :key="index"><strong>{{errorMessage}}</strong></p>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn color="green darken-1" text @click="removeErrorResponse">
              Okay
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
    <v-row class="text-center">
      <v-col cols="8" class="offset-2">
        <v-form ref="form" v-model="valid" lazy-validation>
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

          <vue-phone-number-input
            id="phone_number"
            @update="onUpdate"
            v-model="phone"
            size="lg"
          />
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
              <vue-dropzone
                ref="dropzoneQuoteOptions"
                id="dropzoneQuoteOptions"
                v-on:vdropzone-success="quoteFileUploadSuccess"
                class="dropzone"
                :options="dropzoneQuoteOptions"
              ></vue-dropzone>
              <v-alert
                dense
                outlined
                type="error"
                class="mt-2"
                v-if="isDrawingFileNotUploaded"
              >
                At least one drawing or part file is required to submit a request
              </v-alert>
            </v-col>
            <v-col cols="12" class="col-lg-6 col-sm-12">
              <vue-dropzone
                ref="dropzoneRFQOptions"
                id="dropzoneRFQOptions"
                v-on:vdropzone-success="requirementRFQSuccess"
                class="dropzone"
                :options="dropzoneRFQOptions"
              ></vue-dropzone>
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

              <v-btn color="error" class="mr-4" @click="reset">
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
import CONSTANT from "../../../constant";
import VuePhoneNumberInput from "vue-phone-number-input";
import "../../../custom/css/vue-phone-number-input.css";
import vue2Dropzone from "vue2-dropzone";
import "../../../custom/css/vue2Dropzone.min.css";
import VueRecaptcha from "vue-recaptcha";

export default {
  name: "QuoteForm",
  components: {
    VuePhoneNumberInput,
    vueDropzone: vue2Dropzone,
    VueRecaptcha,
  },
  created: function() {
    self = this;
  },
  data: () => ({
    sitekey: CONSTANT.GOOGLE_CAPTCHA_SITE_KEY,
    dialog: false,
    valid: true,
    isError: {
      status: false,
      errors: []
    },
    isCreatingRFQ: false,
    isLoading: false,
    isSuccess: false,
    company: "",
    RFQFolderId: '',
    PartsFolderId: '',
    SpecsFolderId: '',
    companyRules: [(v) => !!v || "Company is required"],
    name: "",
    nameRules: [(v) => !!v || "Name is required"],
    email: "",
    emailRules: [
      (v) => !!v || "E-mail is required",
      (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
    ],
    phoneDetails: {},
    isPhoneNoValid: true,
    phone: "",
    isDrawingFileNotUploaded: false,
    recapchaToken: null,
    dropzoneQouteFiles: [],
    dropzoneQuoteOptions: {
        method: 'PUT',
      url: "url",
      thumbnailWidth: 75,
      maxFilesize: 100,
      autoProcessQueue: false,
      acceptedFiles:
        ".step,.stp,.sldprt,.stl,.dxf,.ipt,.x_t,.x_b,.3mf,.3dxml,.catpart,.prt,.sat,.pdf",
      headers: {},
      addRemoveLinks: true,
      dictDefaultMessage:
        "<i class='fa fa-cloud-upload'></i> Upload drawings or part files that you want quoted. <br/><strong>Allowed file-types:</strong> STEP, STP, SLDPRT, STL, DXF, IPT, X_T, X_B, 3MF, 3DXML, CATPART, PRT, SAT, PDF",
      init: function() {
        this.on("processing", function(file) {
          self.$refs.dropzoneQuoteOptions.setOption(
            "url",
            `${CONSTANT.API_URL}/file/${self.PartsFolderId}`
          );
        });
        this.on("addedfile", function(_file) {
          self.isDrawingFileNotUploaded = false;
        });
        this.on("error", function(file, msg, xmr) {

          self.isError = {
            status: true,
            errors: [msg]
          }

          // error didn't come from server.. so it's an invalid file
          // just remove it
          if (xmr === undefined) {
            self.$refs.dropzoneQuoteOptions.removeFile(file)
          }
        });
        this.on("complete", function() {
          if (
            self.quoteFileCount ===
              self.$refs.dropzoneQuoteOptions.dropzone.files.length &&
            self.rfqFileCount ===
              self.$refs.dropzoneRFQOptions.dropzone.files.length && self.isLoading == true
          ) {
            self.isLoading = false;
            self.isSuccess = true;
          }
          // console.log("Parts:"+ self.isLoading, self.isSuccess);
        });
      },
    },
    quoteFileCount: 0,
    rfqFileCount: 0,
    dropzoneRFQOptions: {
      url: "url",
      method: 'put',
      thumbnailWidth: 75,
      maxFilesize: 100,
      autoProcessQueue: false,
      acceptedFiles: ".pdf,.docx,.doc,.xlsx,.xls,.csv",
      headers: {},
      addRemoveLinks: true,
      dictDefaultMessage:
        "<i class='fa fa-cloud-upload'></i> If you have an RFQ file or any project specifications, upload them here. <br/><strong>Allowed file-types:</strong> PDF, DOCX, DOC, XLSX, XLS, CSV",
      init: function() {
        this.on("processing", function(file) {
          self.$refs.dropzoneRFQOptions.setOption(
            "url",
            `${CONSTANT.API_URL}/file/${self.SpecsFolderId}`,

          );
        });
        this.on("error", function(file, msg, xmr) {

          self.isError = {
            status: true,
            errors: [msg + '\nPlease try again!']
          }

          if (xmr === undefined) {
            self.$refs.dropzoneRFQOptions.removeFile(file)
          }
        });
        this.on("complete", function(file) {
          if (
            self.quoteFileCount ===
              self.$refs.dropzoneQuoteOptions.dropzone.files.length &&
            self.rfqFileCount ===
              self.$refs.dropzoneRFQOptions.dropzone.files.length && self.isLoading === true
          ) {
            self.isLoading = false;
            self.isSuccess = true;
          }
          // console.log("RFQ:"+self.isLoading, self.isSuccess);
        });
      },
    },
  }),
  mounted: () => {},
  methods: {
    onUpdate: function(payload) {
      this.phoneDetails = payload;
      if (this.phoneDetails.isValid) {
        this.isPhoneNoValid = true;
      }
    },
    validate() {
      if (this.$refs.dropzoneQuoteOptions.dropzone.files.length == 0) {
        this.isDrawingFileNotUploaded = true;
      }
      if (this.phone) {
        if (!this.phoneDetails.isValid) {
          this.isPhoneNoValid = false;
        }
      }

      this.$refs.form.validate();
      if (
        this.$refs.form.validate() &&
        !this.isDrawingFileNotUploaded &&
        this.isPhoneNoValid
      ) {
        this.dialog = true;
      }
    },
    removeErrorResponse(){
      this.isError = {
        status: false,
        errors: []
      }
    },
    reset() {
      this.quoteFileCount = 0;
      this.rfqFileCount = 0;
      this.isCreatingRFQ = false;
      this.isLoading = false;
      this.isSuccess = false;
      // this.removeErrorResponse()
      this.isDrawingFileNotUploaded = false;
      this.phone = "";
      this.phoneDetails = {};
      if (this.recapchaToken) {
        this.$refs.recaptcha.reset();
      }
      this.$refs.dropzoneQuoteOptions.removeAllFiles();
      this.$refs.dropzoneRFQOptions.removeAllFiles();
      this.$refs.form.reset();
    },
    quoteFileUploadSuccess(file, response) {
      this.quoteFileCount += 1;
    },
    requirementRFQSuccess(file, response) {
      this.rfqFileCount += 1;
    },
    async verifyCallback(response) {
      if (response) {
        const personalData = {
          company: this.company,
          name: this.name,
          email: this.email,
          phone: this.phone,
          token: response,
        };

        try {
            this.isCreatingRFQ = true;

            const rawResponse = await fetch(`${CONSTANT.API_URL}/rfq`, {
              method: "PUT",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify(personalData),
            });

            if(!rawResponse.ok){
                this.dialog = false;
                if( rawResponse.status === 400 ){
                  this.isError = {
                      status: true,
                      errors: ['Data validation error.']
                  }
                }else{
                  this.isError = {
                    status: true,
                    errors: ['Server response error.']
                  }
                }
            }

            const rfqResponse = await rawResponse.json();
            console.log(rfqResponse);
            if (rfqResponse.rfqFolderId) {
                this.isCreatingRFQ = false;
                this.isLoading = true;

                this.RFQFolderId = rfqResponse.rfqFolderId;
                this.PartsFolderId = rfqResponse.partsFolderId;
                this.SpecsFolderId = rfqResponse.specsFolderId;

                this.recapchaToken = response;
                this.dialog = false;
                
                this.$refs.dropzoneQuoteOptions.processQueue();
                this.$refs.dropzoneRFQOptions.processQueue();
            }
            else {
                // TODO: error

              this.reset();
            }
        } catch (error) {
          console.log(error)
        }
      }
    },
  },
};
</script>

<style scoped>
@import url("https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css");
#phone_number {
  min-height: 56px;
  margin-bottom: 30px;
}
.dropzone {
  min-height: 344px;
  max-height: 500px;
  overflow-y: scroll;
}
.recaptcha_style,
#recatcha_alert_msg {
  width: 304px;
  margin: 25px auto;
}
</style>
