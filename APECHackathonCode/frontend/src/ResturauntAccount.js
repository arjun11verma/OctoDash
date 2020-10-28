class ResturauntAccount {
    constructor(username, password, resturauntName, customersPerWeek, suppliesPerWeek) {
        this.username = username;
        this.password = password;
        this.resturauntName = resturauntName;
        this.customersPerWeek = customersPerWeek;
        this.suppliesPerWeek = suppliesPerWeek;
    }

    get username() {
        return this.username;
    }

    get password() {
        return this.password;
    }

    get resturauntName() {
        return this.resturauntName;
    }

    get customersPerWeek() {
        return this.customersPerWeek;
    }

    get suppliesPerWeek() {
        return this.suppliesPerWeek;
    }
}

export default ResturauntAccount;