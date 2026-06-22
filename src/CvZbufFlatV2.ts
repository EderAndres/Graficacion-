// CvHbuff: Used in the file Zbuff visor.
import { Obj3D } from './Obj3D.js';
import { Point2D } from './point2D.js';
import { Dimension } from './Dimension.js';
import { Polygon3D } from './Polygon3D.js';
import { Point3D } from './point3D.js';
import { Tria } from './Tria.js'
import { Tools2D } from './Tools2D.js'
export class CvZbuf{ //extends Canvas3D {
  private maxX: number; maxY: number; centerX: number; centerY: number; maxX0 = -1; maxY0 = -1;
  private buf: number[][];
  private obj: Obj3D;
  private imgCenter: Point2D;
  private g: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(g: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.g = g;
    this.canvas = canvas;
  }
  
  iX(x: number): number{return Math.round(this.centerX + x - this.imgCenter.x);}
  iY(y: number): number{ return Math.round(this.centerY - y + this.imgCenter.y);}
  
  getObj(): Obj3D { return this.obj; }
  setObj(obj: Obj3D ):void {this.obj = obj;}
  
  paint(): void{
    if (this.obj == undefined) return;
    let polyList:Array<Polygon3D> = this.obj.getPolyList();
    if (polyList == undefined) return;
    let nFaces: number = polyList.length;
    if (nFaces == 0) return;
    //let xe:number, ye:number, ze:number;
    let dim: Dimension = new Dimension(this.canvas.width, this.canvas.height);
    this.canvas.width=this.canvas.width;
    this.maxX = dim.width - 1; this.maxY = dim.height - 1;
    this.centerX = this.maxX/2; this.centerY = this.maxY/2;
      // ze-axis towards eye, so ze-coordinates of
      // object points are all negative. Since screen
      // coordinates x and y are used to interpolate for
      // the z-direction, we have to deal with 1/z instead
      // of z. With negative z, a small value of 1/z means
      // a small value of |z| for a nearby point. We there-
      // fore begin with large buffer values 1e30:
    if (this.maxX != this.maxX0 || this.maxY != this.maxY0) {
      //buf = new float[dim.width][dim.height];
      this.buf = new Array(dim.width);
      for (let i = 0; i < dim.width; i++) 
        this.buf[i] = new Array(dim.height);
      this.maxX0 = this.maxX; this.maxY0 = this.maxY;
    }
    for (let iy=0; iy<dim.height; iy++)
      for (let ix = 0; ix < dim.width; ix++)
        this.buf[ix][iy] = 1e30;

    this.obj.eyeAndScreen(dim);
    this.imgCenter = this.obj.getImgCenter();
    this.obj.planeCoeff(); // Compute a, b, c and h.
    let e: Point3D[] = this.obj.getE();
    let vScr: Point2D[]  = this.obj.getVScr();

    for (let j = 0; j < nFaces; j++) {  
      let pol: Polygon3D = polyList[j];
      if (pol.getNrs().length < 3)
        continue;
      let strokeColor = '';
      let fillColor = '';
      let nrs = pol.getNrs();
      let maxIdx = 0;
      for (let k = 0; k < nrs.length; k++) {
        let idx = Math.abs(nrs[k]);
        if (idx > maxIdx) maxIdx = idx;
      }

      // Check if it's the robot arm model by name or vertex count
      const isKuka = (this.obj.name && this.obj.name.toLowerCase().includes('brazo')) || this.obj.w.length > 240;

      // Two-sided lighting calculation
      let aNormal = pol.getA();
      let bNormal = pol.getB();
      let cNormal = pol.getC();
      let sunX = -1 / Math.sqrt(3);
      let sunY = 1 / Math.sqrt(3);
      let sunZ = 1 / Math.sqrt(3);
      let dot = aNormal * sunX + bNormal * sunY + cNormal * sunZ;
      let lightFactor = 0.35 + 0.65 * Math.abs(dot); // Ambient light + Diffuse absolute lighting

      if (isKuka) {
        if (maxIdx <= 99) {
          // Base - Gris oscuro
          let r = Math.round(65 * lightFactor);
          let g = Math.round(65 * lightFactor);
          let b = Math.round(70 * lightFactor);
          fillColor = `rgb(${r}, ${g}, ${b})`;
          strokeColor = fillColor;
        } else if (maxIdx >= 100 && maxIdx <= 199) {
          // Brazo Inferior - Naranja KUKA
          let r = Math.round(255 * lightFactor);
          let g = Math.round(106 * lightFactor);
          let b = 0;
          fillColor = `rgb(${r}, ${g}, ${b})`;
          strokeColor = fillColor;
        } else if (maxIdx >= 200 && maxIdx <= 299) {
          // Brazo Superior - Naranja KUKA
          let r = Math.round(255 * lightFactor);
          let g = Math.round(106 * lightFactor);
          let b = 0;
          fillColor = `rgb(${r}, ${g}, ${b})`;
          strokeColor = fillColor;
        } else {
          // Pinzas / Muñeca - Gris plateado
          let r = Math.round(190 * lightFactor);
          let g = Math.round(190 * lightFactor);
          let b = Math.round(195 * lightFactor);
          fillColor = `rgb(${r}, ${g}, ${b})`;
          strokeColor = fillColor;
        }
      } else {
        // Otros modelos - Azul cian
        let r = 0;
        let g = Math.round(180 * lightFactor);
        let b = Math.round(230 * lightFactor);
        fillColor = `rgb(${r}, ${g}, ${b})`;
        strokeColor = fillColor;
      }

      this.g.strokeStyle = strokeColor;
      this.g.fillStyle = fillColor;
      pol.triangulate(this.obj);

      let t: Tria[] = pol.getT();
      for (let i = 0; i < t.length; i++){  
        let tri: Tria  = t[i];
        let iA = tri.iA, iB = tri.iB, iC = tri.iC;
        let a: Point2D = vScr[iA], b: Point2D = vScr[iB], c: Point2D = vScr[iC];
        let zAi: number = 1/e[tri.iA].z, zBi: number = 1/e[tri.iB].z,
            zCi: number = 1/e[tri.iC].z;
        
        let u1 = b.x - a.x, v1 = c.x - a.x,
            u2 = b.y - a.y, v2 = c.y - a.y,
            cc=u1*v2-u2*v1;
        if (Math.abs(cc) < 1e-5) continue;
        let xA = a.x, yA = a.y,
            xB = b.x, yB = b.y,
            xC = c.x, yC = c.y,
            xD = (xA + xB + xC) / 3,
            yD = (yA + yB + yC) / 3,
            zDi = (zAi + zBi + zCi) / 3,
            u3 = zBi - zAi, v3 = zCi - zAi,
            aa = u2 * v3 - u3 * v2,
            bb = u3 * v1 - u1 * v3,
            dzdx = -aa / cc, dzdy = -bb / cc;
        let yBottomR = Math.min(yA, Math.min(yB, yC)),
            yTopR = Math.max(yA, Math.max(yB, yC));
        let yBottom = Math.ceil(yBottomR),
            yTop = Math.floor(yTopR);

        for (let y=yBottom; y<=yTop; y++){
          let xI: number, xJ: number, xK: number, xI1: number, xJ1: number,
              xK1: number, xL: number, xR: number;
          xI = xJ = xK = 1e30;
          xI1 = xJ1 = xK1 = -1e30;
          if((y-yB)*(y-yC)<=0&&yB!=yC)
            xI = xI1 = xC + (y - yC)/(yB - yC) * (xB - xC);
          if((y-yC)*(y-yA)<=0&&yC!=yA)
            xJ = xJ1 = xA + (y - yA)/(yC - yA) * (xC - xA);
          if((y-yA)*(y-yB)<=0&&yA!=yB)
             xK = xK1 = xB + (y - yB)/(yA - yB) * (xA - xB);
          xL = Math.min(xI, Math.min(xJ, xK));
          xR = Math.max(xI1, Math.max(xJ1, xK1));
          
          let iy = this.iY(y), iXL = this.iX((xL-0.5)),
              iXR = this.iX((xR+0.5));
          let zi = 1.01 * zDi + (y - yD) * dzdy +
                                   (xL - xD) * dzdx;

          let leftmostValid: boolean = false;
          let xLeftmost: number = 0;
          for (let ix = iXL; ix <= iXR; ix++){
            if (zi < this.buf[ix][iy]){// < means nearer
              this.buf[ix][iy] = zi;
              if (!leftmostValid){
                xLeftmost = ix;
                leftmostValid = true;
              }
            }
            else {
              if (leftmostValid) {
                this.g.fillRect(xLeftmost, iy, ix - xLeftmost, 1);
                leftmostValid = false;
              } 
            }
            zi += dzdx;
          }
          if (leftmostValid) {
            this.g.fillRect(xLeftmost, iy, iXR - xLeftmost + 1, 1);
          }
        }
      }
    }
  }
}
