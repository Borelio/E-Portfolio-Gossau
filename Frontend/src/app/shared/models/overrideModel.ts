export class OverrideModel {
  public mainImage: string = 'assets/images/picture1_small.jpg';
  public image1: string = 'assets/images/picture1.jpg';
  public image1Edited: string = 'assets/images/picture1_edited.jpg';
  public image2: string = 'assets/images/picture2.jpg';
  public image2Edited: string = 'assets/images/picture2_edited.jpg';
  public image3: string = 'assets/images/picture3.jpg';
  public image3Edited: string = 'assets/images/picture3_edited.jpg';

  public boostSound: string = 'assets/sounds/boost.mp3';
  public kaboomSound: string = 'assets/sounds/kaboom.mp3';
  public motorSound: string = 'assets/sounds/motor.mp3';
  public honkSound: string = 'assets/sounds/pinguHonk.mp3';

  public websocket: string = 'wss://gossau-be.nussmueller.dev';

  public whyText: string | undefined;
  public gameText: string | undefined;

  public videoIframeCode: string | undefined;
  public extraScriptCode: string | undefined;

  public forceRedirect: string | undefined;
}
