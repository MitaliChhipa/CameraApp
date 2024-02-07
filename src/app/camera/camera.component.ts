import { Component, ElementRef, ViewChild ,AfterViewInit, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.css']
})
export class CameraComponent  {

 
  arr:any[]=[]
  title = 'webcam';
  stream: any = null;
  status: any = null;
  previewVideo: string = '';
  play=true;
  videoRecorder: MediaRecorder | null = null;
  videoChunks: Blob[] = [];
  isRecording = false;
  
  selectedCamera: MediaDeviceInfo | null = null;
  cameras: MediaDeviceInfo[] = [];
 
  @ViewChild('videoPlayer') videoPlayer: ElementRef|undefined; 
   @ViewChild('video') video !: ElementRef;
  videoUrl: any;

  constructor(private sanitizer: DomSanitizer){

  }
 
 
  // ngAfterViewInit() {
   
  //   this.getCameras();
   
  // }
 
  getCameras() {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        this.cameras = devices.filter(device => device.kind === 'videoinput');
        if (this.cameras.length > 0) {
          this.selectedCamera = this.cameras[0];
          
        }
      })
      .catch(err => console.error('Error enumerating devices: ', err));
  }
 
  switchCamera() {
    if (this.selectedCamera && this.stream) {
      
      this.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      this.Stream(this.selectedCamera);
    }
  }
 
  Stream(device: MediaDeviceInfo) {
   
    navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: device.deviceId },
               width: { ideal: 4096 },
               height: { ideal: 2160 } },
      audio: true
    }).then((res) => {
     
      this.stream = res;
      this.status = 'My camera is accessing';
      this.video.nativeElement.srcObject= new MediaStream(res.getVideoTracks())
      this.video.nativeElement.play();
      this.Resolution()
    }).catch(err => {

      if (err?.message === 'Permission denied') {
        this.status = 'Permission denied, please try again by approving the access';
      } else {
        this.status = 'Error accessing camera';
      }
    });
  }
 
  
 
  startRecording() {
    if (this.stream) {
    
      this.videoChunks = [];
      this.videoRecorder = new MediaRecorder(this.stream, { mimeType: 'video/webm;codecs=vp9,opus' });
 
      this.videoRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.videoChunks.push(event.data);
        }
      };
 
      this.videoRecorder.onstop = () => {
        const blob = new Blob(this.videoChunks, { type: 'video/webm' });
        this.previewVideo = URL.createObjectURL(blob);
        this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.previewVideo);
      
        this.isRecording = false;
      };
 
      this.videoRecorder.start();
      this.isRecording = true;
    }
  }
 
 
  stopRecording() {
    if (this.videoRecorder && this.isRecording) {
      
      this.videoRecorder.stop();
      
    }
  }
 
  downloadVideo() {
    if (this.previewVideo) {
      const a = document.createElement('a');
      a.href = this.previewVideo;
      a.download = 'recorded-video.mp4';
      a.click();
    }
  }

  playStream() {
    this.video.nativeElement.play();
    this.play=true;
    }
  pauseStream() {
    this.video.nativeElement.pause();
    this.play=false;
  }
 
  checkPermissions() {
    navigator.mediaDevices.getUserMedia({
      video: {width: { ideal: 4096 },
              height: { ideal: 2160 }} 
    }).then((res) => {
     
      this.stream = res;
      this.video.nativeElement.srcObject = new MediaStream(res.getVideoTracks());
      this.video.nativeElement.play();
      this.getCameras();
      this.Resolution();
      
      alert('Your Camera is accessing')
      
     
    }).catch(err => {
      
 
      if (err?.message === 'Permission denied') {
        
        alert('Permission denied, please try again by approving the access to Camera')
      } else {
        
        alert('No Camera available on your device')
      }
    });
    
    navigator.mediaDevices.getUserMedia({
      // video: {width: { ideal: 4096 },
      // height: { ideal: 2160 }},
      audio:true
    }).then((res) => {
     
      // this.stream = res;
      // this.status = 'Your Microphone is accessing';
      alert('Your Microphone is accessing')
      
      this.stream.addTrack(res.getAudioTracks()[0])
      // this.video.nativeElement.srcObject = new MediaStream(res.getVideoTracks());
      // this.video.nativeElement.play();
      // this.getCameras();
      // this.Resolution();
     
    }).catch(err => {
      
 
      if (err?.message === 'Permission denied') {
        
        alert('Permission denied, please try again by approving the access to Microphone')
      } else {
        
        alert('No Microphone available on your device')
      }
    });
  }
  resolution: string="";
  Resolution() {
    const track = this.stream.getVideoTracks()[0];
    const settings = track.getSettings();
    this.resolution = settings.width + 'x' + settings.height;
  }

}
