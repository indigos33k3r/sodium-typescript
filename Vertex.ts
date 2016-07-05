export class Source {
    constructor(
        origin : Vertex,
        register_ : () => () => void
    ) {
        if (origin === null)
            throw new Error("null origin!");
        this.origin = origin;
        this.register_ = register_;
    }
    private origin : Vertex;
    private register_ : () => () => void;
    private registered : boolean = false;
    private deregister_ : () => void = null;

    register(target : Vertex) : void {
        if (!this.registered) {
            this.registered = true;
            this.origin.register(target);
            if (this.register_ !== null)
                this.deregister_ = this.register_();
        }
    }
    deregister(target : Vertex) : void {
        if (this.registered) {
            this.registered = false;
            if (this.deregister_ !== null)
                this.deregister_();
            this.origin.deregister(target);
        }
    }
}

export class Vertex {
    static NULL : Vertex = new Vertex(1e12, []);

	constructor(rank : number, sources : Source[]) {
		this.rank = rank;
		this.sources = sources;
	}
    rank : number;
    sources : Source[];
    targets : Vertex[] = [];
    registrationCount : number = 0;
    visited : boolean = false;
    register(target : Vertex) : boolean {
        let anyChanged : boolean = false;
        for (let i = 0; i < this.sources.length; i++)
            if (this.sources[i].register(this))
                anyChanged = true;
        this.registrationCount++;
        this.targets.push(target);
        if (target.ensureBiggerThan(this.rank))
            anyChanged = true;
        return anyChanged;
    }
    deregister(target : Vertex) : void {
        this.registrationCount--;
        for (let i = 0; i < this.sources.length; i++)
            this.sources[i].deregister(this);
        for (let i = 0; i < this.targets.length; i++)
            if (this.targets[i] === target) {
                this.targets.splice(i, 1);
                break;
            }
    }

	private ensureBiggerThan(limit : number) : boolean {
		if (this.rank > limit || this.visited)
			return false;

        this.visited = true;
		this.rank = limit + 1;
		for (let i = 0; i < this.targets.length; i++)
			this.targets[i].ensureBiggerThan(this.rank);
        this.visited = false;
		return true;
	}
}
