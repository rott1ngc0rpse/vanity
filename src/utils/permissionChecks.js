class PermissionChecker {
  constructor(guild, executor, target, command) {
    this.guild = guild;
    this.executor = executor;
    this.target = target;
    this.command = command;
    this.error = null;
  }

  async check() {
    if (!this.target) {
      this.error = `The specified user is not in the server.`;
      return false;
    }

    const checks = [
      this.checkOwner,
      this.checkSelf,
      this.checkBot,
      this.checkRoleHierarchy
    ];

    for (const check of checks) {
      if (await check.call(this)) {
        return false;
      }
    }

    return true;
  }

  checkOwner() {
    if (this.target.id === this.guild.ownerId) {
      this.error = `You cannot ${this.command} the server owner.`;
      return true;
    }
    return false;
  }

  checkSelf() {
    if (this.target.id === this.executor.id) {
      this.error = `You cannot ${this.command} yourself.`;
      return true;
    }
    return false;
  }

  checkBot() {
    if (this.target.id === this.guild.client.user.id) {
      this.error = `I cannot ${this.command} myself.`;
      return true;
    }
    return false;
  }

  checkRoleHierarchy() {
    if (this.executor.roles.highest.position >= this.executor.roles.highest.position && this.executor.id !== this.guild.ownerId) {
      this.error = `You cannot ${this.command} someone with a higher or equal role.`;
      return true;
    }
    if (this.target.roles.highest.position >= this.guild.members.me.roles.highest.position) {
      this.error = `I cannot ${this.command} someone with a higher or equal role to me.`;
      return true;
    }
    return false;
  }

  getError() {
    return this.error;
  }
}

module.exports = PermissionChecker;