update() {
    if (!this.roundActive || this.isSuperFrozen) return;
    
    // FIXED: Only allow keyboard movement when NOT using mobile controls
    let move = 0;
    if (!this.mobileLeftPressed && !this.mobileRightPressed) {
        if (this.keyLeft.isDown && !this.isAttacking && !this.isJumping) move = -1;
        if (this.keyRight.isDown && !this.isAttacking && !this.isJumping) move = 1;
        if (move !== 0) this.player.x += move * 7;
    }
    
    // Jump (keyboard only when not using mobile jump)
    if (!this.mobileJumpRequested && this.keySpace.isDown && !this.isJumping && !this.isAttacking && this.roundActive && !this.isSuperFrozen) {
        this.isJumping = true;
        this.playerYVelocity = JUMP_VELOCITY;
        this.animations.setPlayerAnimation('jump', 300);
    }
    
    // ... rest of update method
}