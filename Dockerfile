# 1. Runtime Base
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# 2. Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy ALL csproj files to restore dependencies
COPY ["SwiftBank_Api/SwiftBank_Api/SwiftBank_Api.csproj", "SwiftBank_Api/SwiftBank_Api/"]
COPY ["SwiftBank_Api/SwiftBank.Application/SwiftBank.Application.csproj", "SwiftBank_Api/SwiftBank.Application/"]
COPY ["SwiftBank_Api/SwiftBank.Infrastructure/SwiftBank.Infrastructure.csproj", "SwiftBank_Api/SwiftBank.Infrastructure/"]
COPY ["SwiftBank_Api/SwiftBank.Domain/SwiftBank.Domain.csproj", "SwiftBank_Api/SwiftBank.Domain/"]

# Restore the API project (this will automatically restore the referenced projects)
RUN dotnet restore "SwiftBank_Api/SwiftBank_Api/SwiftBank_Api.csproj"

# Copy the rest of the files
COPY . .

# Publish the API project
WORKDIR "/src/SwiftBank_Api/SwiftBank_Api"
RUN dotnet publish "SwiftBank_Api.csproj" -c Release -o /app/publish

# 3. Final Stage
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "SwiftBank_Api.dll"]