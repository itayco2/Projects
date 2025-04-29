namespace University_backend;

public abstract class BaseError
{
    public string Message { get; set; }

    protected BaseError(string message)
    {
        Message = message;
    }
}

public class RouteNotFoundError : BaseError // 404
{
    public RouteNotFoundError(string method, string route) :
        base($"Route '{route}' on method '{method}' not exits.")
    { }
}

public class ResourceNotFound : BaseError // 404
{
    public ResourceNotFound(Guid id) :
        base($"id '{id}' not found")
    { }
}

public class ValidationError : BaseError // 400
{
    public ValidationError(string message) : base(message) { }
}

public class UnauthorizedError : BaseError // 401
{
    public UnauthorizedError(string message) : base(message) { }
}


public class InternalServerError : BaseError // 500
{
    public InternalServerError(string message) : base(message) { }
}