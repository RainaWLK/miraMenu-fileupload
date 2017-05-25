##  See http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html
#set($allParams = $input.params())
{
    "body" : $input.json('$'),
    "params" : {
        "resource": "$context.resourcePath",
        #set($path = $allParams.get("path"))
        "path" : {
            #foreach($paramName in $path.keySet())
            "$paramName" : "$util.escapeJavaScript($path.get($paramName))"
                #if($foreach.hasNext),#end
            #end
        },
        #set($querystring = $allParams.get("querystring"))
        "querystring" : {
            #foreach($paramName in $querystring.keySet())
            "$paramName" : "$util.escapeJavaScript($querystring.get($paramName))"
                #if($foreach.hasNext),#end
            #end
        }

    }

}