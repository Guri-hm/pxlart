import React, { useEffect, useRef } from "react";

export default function Confetti() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const TWO_PI = Math.PI * 2;
    const HALF_PI = Math.PI * 0.5;
    var viewWidth = 800,
        viewHeight = 500,
        timeStep = (1 / 60);

    let Point = function (this: any, x: any, y: any) {
        this.x = x || 0;
        this.y = y || 0;
    }

    let Particle = function (this: any, p0: any, p1: any, p2: any, p3: any) {
        this.p0 = p0;
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;

        this.time = 0;
        this.duration = 3 + Math.random() * 2;
        this.color = '#' + Math.floor((Math.random() * 0xffffff)).toString(16);

        this.w = 8;
        this.h = 6;

        this.complete = false;
    };

    Particle.prototype = {
        update: function () {
            this.time = Math.min(this.duration, this.time + timeStep);

            var f = Ease.outCubic(this.time, 0, 1, this.duration);
            var p = cubeBezier(this.p0, this.p1, this.p2, this.p3, f);

            var dx = p.x - this.x;
            var dy = p.y - this.y;

            this.r = Math.atan2(dy, dx) + HALF_PI;
            this.sy = Math.sin(Math.PI * f * 10);
            this.x = p.x;
            this.y = p.y;

            this.complete = this.time === this.duration;
        },
        draw: function () {
            if (!canvasRef.current) return;

            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.r);
            ctx.scale(1, this.sy);

            ctx.fillStyle = this.color;
            ctx.fillRect(-this.w * 0.5, -this.h * 0.5, this.w, this.h);

            ctx.restore();
        }
    };

    let Loader = function (this: any, x: number, y: number) {
        this.x = x;
        this.y = y;

        this.r = 24;
        this._progress = 0;

        this.complete = false;
    };

    Loader.prototype = {
        reset: function () {
            this._progress = 0;
            this.complete = false;
        },
        set progress(p) {
            this._progress = p < 0 ? 0 : (p > 1 ? 1 : p);

            this.complete = this._progress === 1;
        },
        get progress() {
            return this._progress;
        },
        draw: function () {
            if (!canvasRef.current) return;

            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, -HALF_PI, TWO_PI * this._progress - HALF_PI);
            ctx.lineTo(this.x, this.y);
            ctx.closePath();
            ctx.fill();
        }
    };

    // pun intended
    let Exploader = function (this: any, x: number, y: number) {
        this.x = x;
        this.y = y;

        this.startRadius = 24;

        this.time = 0;
        this.duration = 0.4;
        this.progress = 0;

        this.complete = false;
    };

    Exploader.prototype = {
        reset: function () {
            this.time = 0;
            this.progress = 0;
            this.complete = false;
        },
        update: function () {
            this.time = Math.min(this.duration, this.time + timeStep);
            this.progress = Ease.inBack(this.time, 0, 1, this.duration);

            this.complete = this.time === this.duration;
        },
        draw: function () {
            if (!canvasRef.current) return;

            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.startRadius * (1 - this.progress), 0, TWO_PI);
            ctx.fill();
        }
    };

    var particles: any[] = [],
        loader: any,
        exploader: any,
        phase = 0;

    function initDrawingCanvas() {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

        canvas.width = viewWidth;
        canvas.height = viewHeight;

        createLoader();
        createExploader();
        createParticles();
    }

    function createLoader() {
        loader = new (Loader as any)(viewWidth * 0.5, viewHeight * 0.5);
    }

    function createExploader() {
        exploader = new (Exploader as any)(viewWidth * 0.5, viewHeight * 0.5);
    }

    function createParticles() {
        for (var i = 0; i < 128; i++) {
            var p0 = new (Point as any)(viewWidth * 0.5, viewHeight * 0.5);
            var p1 = new (Point as any)(Math.random() * viewWidth, Math.random() * viewHeight);
            var p2 = new (Point as any)(Math.random() * viewWidth, Math.random() * viewHeight);
            var p3 = new (Point as any)(Math.random() * viewWidth, viewHeight + 64);

            particles.push(new (Particle as any)(p0, p1, p2, p3));
        }
    }

    function update() {

        switch (phase) {
            case 0:
                loader.progress += (1 / 45);
                break;
            case 1:
                exploader.update();
                break;
            case 2:
                particles.forEach(function (p) {
                    p.update();
                });
                break;
        }
    }

    function draw() {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

        ctx.clearRect(0, 0, viewWidth, viewHeight);

        switch (phase) {
            case 0:
                loader.draw();
                break;
            case 1:
                exploader.draw();
                break;
            case 2:
                particles.forEach(function (p) {
                    p.draw();
                });
                break;
        }
    }

    function loop() {
        update();
        draw();

        phase = 1;

        if (phase === 1 && exploader.complete) {
            phase = 2;
        }
        if (phase === 2 && checkParticlesComplete()) {
            if (!canvasRef.current) return;
            const canvas = canvasRef.current;
            canvas.style.display = 'none';;
            return;
            //繰り返しさせない
            // reset
            // phase = 0;
            // loader.reset();
            // exploader.reset();
            // particles.length = 0;
            // createParticles();
        }

        requestAnimationFrame(loop);
    }

    function checkParticlesComplete() {
        for (var i = 0; i < particles.length; i++) {
            if (particles[i].complete === false) return false;
        }
        return true;
    }

    // math and stuff

    /**
    * easing equations from http://gizma.com/easing/
    * t = current time
    * b = start value
    * c = delta value
    * d = duration
    */
    var Ease = {
        inCubic: function (t: any, b: any, c: any, d: any) {
            t /= d;
            return c * t * t * t + b;
        },
        outCubic: function (t: any, b: any, c: any, d: any) {
            t /= d;
            t--;
            return c * (t * t * t + 1) + b;
        },
        inOutCubic: function (t: any, b: any, c: any, d: any) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t * t + b;
            t -= 2;
            return c / 2 * (t * t * t + 2) + b;
        },
        inBack: function (t: any, b: any, c: any, d: any) {
            let s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        }
    };

    function cubeBezier(p0: any, c0: any, c1: any, p1: any, t: any) {
        var p = new (Point as any)();
        var nt = (1 - t);

        p.x = nt * nt * nt * p0.x + 3 * nt * nt * t * c0.x + 3 * nt * t * t * c1.x + t * t * t * p1.x;
        p.y = nt * nt * nt * p0.y + 3 * nt * nt * t * c0.y + 3 * nt * t * t * c1.y + t * t * t * p1.y;

        return p;
    }

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

        initDrawingCanvas();
        requestAnimationFrame(loop);
    }, []);

    return (
        <>
            <canvas ref={canvasRef} style={{ width: "100%", position: "absolute", zIndex: 9999 }} />
        </>
    );
}