import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Using d3 within Angular 8';
  speechRecogitionState = false;

  constructor(private router: Router, private ngZone: NgZone) {}

  ngOnInit() {
  }

  toggleSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new window['webkitSpeechRecognition']();

        recognition.continuous = true;
        recognition.onresult = (event) => {
          const voiceCommand = event.results[event.results.length-1][0].transcript;

          this.handleVoiceCommand(voiceCommand);
        }

        recognition.start();
    }
  }

    handleVoiceCommand(command) {
        const deliveryMatcher = new RegExp('.*delivery.*');
        const statusMatcher = new RegExp('.*status.*');
        console.log(command);
        console.log(deliveryMatcher.test(command.trim()));
        console.log(statusMatcher.test(command.trim()));
        if (deliveryMatcher.test(command.trim())) {
            this.navigate('/delivery');
            return;
         }
        if (statusMatcher.test(command.trim())) {
            this.navigate('/status');
            return;
         }
    }

    navigate(path) {
    this.ngZone.run(() => {
        this.router.navigate([path]);
    });

    }

}
